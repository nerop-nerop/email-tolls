import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import {
  extractEmailsFromText,
  normalizeEmail,
  ParsedEmail,
  shouldSkipEmail,
} from './email-regex.util';

@Injectable()
export class HtmlParser {
  private readonly logger = new Logger(HtmlParser.name);

  async parseUrls(
    urls: string[],
    skipSupport = true,
  ): Promise<ParsedEmail[]> {
    const results: ParsedEmail[] = [];
    const seen = new Set<string>();

    for (const url of urls) {
      try {
        const allowed = await this.isAllowedByRobots(url);
        if (!allowed) {
          this.logger.warn(`Blocked by robots.txt: ${url}`);
          continue;
        }
        const emails = await this.fetchEmailsFromUrl(url, skipSupport);
        for (const item of emails) {
          if (seen.has(item.email)) continue;
          seen.add(item.email);
          results.push(item);
        }
      } catch (err) {
        this.logger.warn(`Failed to parse ${url}: ${String(err)}`);
      }
    }
    return results;
  }

  private async fetchEmailsFromUrl(
    url: string,
    skipSupport: boolean,
  ): Promise<ParsedEmail[]> {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'MessengerEmailTool/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const text = $('body').text();
    const mailtoLinks: string[] = [];
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      const addr = href.replace(/^mailto:/i, '').split('?')[0];
      if (addr) mailtoLinks.push(addr);
    });

    const allText = `${text} ${mailtoLinks.join(' ')}`;
    const emails = extractEmailsFromText(allText);
    return emails
      .map((e) => normalizeEmail(e))
      .filter((e) => !(skipSupport && shouldSkipEmail(e)))
      .map((email) => ({ email, company: new URL(url).hostname }));
  }

  private async isAllowedByRobots(url: string): Promise<boolean> {
    try {
      const parsed = new URL(url);
      const robotsUrl = `${parsed.origin}/robots.txt`;
      const res = await fetch(robotsUrl, {
        signal: AbortSignal.timeout(5_000),
      });
      if (!res.ok) return true;
      const text = await res.text();
      const path = parsed.pathname || '/';
      let inUserAgentAll = false;
      for (const line of text.split('\n')) {
        const trimmed = line.trim().toLowerCase();
        if (trimmed.startsWith('user-agent:')) {
          const agent = trimmed.slice('user-agent:'.length).trim();
          inUserAgentAll = agent === '*' || agent.includes('messengeremailtool');
        }
        if (inUserAgentAll && trimmed.startsWith('disallow:')) {
          const rule = trimmed.slice('disallow:'.length).trim();
          if (rule && path.startsWith(rule)) return false;
        }
      }
      return true;
    } catch {
      return true;
    }
  }
}
