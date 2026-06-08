import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImapFlow } from 'imapflow';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import {
  extractEmailsFromText,
  normalizeEmail,
  ParsedEmail,
  shouldSkipEmail,
} from '../parser/email-regex.util';

@Injectable()
export class MailboxParser {
  private readonly logger = new Logger(MailboxParser.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async importFromProvider(
    provider: 'gmail' | 'outlook' | 'mailru',
    skipSupport = true,
  ): Promise<ParsedEmail[]> {
    if (provider === 'gmail') {
      return this.importFromGmail(skipSupport);
    }
    if (provider === 'outlook') {
      return this.importFromOutlook(skipSupport);
    }
    return this.importFromMailRu(skipSupport);
  }

  private async importFromGmail(skipSupport: boolean): Promise<ParsedEmail[]> {
    const token = await this.prisma.mailboxToken.findUnique({
      where: { provider: 'gmail' },
    });
    if (!token) {
      throw new Error('Gmail not connected. Visit /api/auth/google');
    }

    const oauth2 = new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
    );
    oauth2.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken ?? undefined,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2 });
    const people = google.people({ version: 'v1', auth: oauth2 });
    const results: ParsedEmail[] = [];
    const seen = new Set<string>();

    try {
      const connections = await people.people.connections.list({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names',
        pageSize: 500,
      });
      for (const person of connections.data.connections ?? []) {
        for (const ea of person.emailAddresses ?? []) {
          if (!ea.value) continue;
          const email = normalizeEmail(ea.value);
          if (skipSupport && shouldSkipEmail(email)) continue;
          if (seen.has(email)) continue;
          seen.add(email);
          results.push({
            email,
            name: person.names?.[0]?.displayName ?? undefined,
          });
        }
      }
    } catch (err) {
      this.logger.warn(`Gmail People API: ${String(err)}`);
    }

    try {
      const messages = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
      });
      for (const msg of messages.data.messages ?? []) {
        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Cc'],
        });
        for (const header of full.data.payload?.headers ?? []) {
          if (!['From', 'To', 'Cc'].includes(header.name ?? '')) continue;
          for (const raw of extractEmailsFromText(header.value ?? '')) {
            const email = normalizeEmail(raw);
            if (skipSupport && shouldSkipEmail(email)) continue;
            if (seen.has(email)) continue;
            seen.add(email);
            results.push({ email });
          }
        }
      }
    } catch (err) {
      this.logger.warn(`Gmail messages: ${String(err)}`);
    }

    return results;
  }

  private async importFromOutlook(skipSupport: boolean): Promise<ParsedEmail[]> {
    const token = await this.prisma.mailboxToken.findUnique({
      where: { provider: 'outlook' },
    });
    if (!token) {
      throw new Error('Outlook not connected. Visit /api/auth/microsoft');
    }

    const client = Client.init({
      authProvider: (done) => done(null, token.accessToken),
    });

    const results: ParsedEmail[] = [];
    const seen = new Set<string>();

    try {
      const contacts = await client.api('/me/contacts').top(500).get();
      for (const contact of contacts.value ?? []) {
        for (const ea of contact.emailAddresses ?? []) {
          if (!ea.address) continue;
          const email = normalizeEmail(ea.address);
          if (skipSupport && shouldSkipEmail(email)) continue;
          if (seen.has(email)) continue;
          seen.add(email);
          results.push({
            email,
            name: contact.displayName,
            company: contact.companyName,
          });
        }
      }
    } catch (err) {
      this.logger.warn(`Outlook contacts: ${String(err)}`);
    }

    try {
      const messages = await client.api('/me/messages').top(100).select('from,toRecipients,ccRecipients').get();
      for (const msg of messages.value ?? []) {
        const addrs: string[] = [];
        if (msg.from?.emailAddress?.address) addrs.push(msg.from.emailAddress.address);
        for (const r of msg.toRecipients ?? []) {
          if (r.emailAddress?.address) addrs.push(r.emailAddress.address);
        }
        for (const r of msg.ccRecipients ?? []) {
          if (r.emailAddress?.address) addrs.push(r.emailAddress.address);
        }
        for (const raw of addrs) {
          const email = normalizeEmail(raw);
          if (skipSupport && shouldSkipEmail(email)) continue;
          if (seen.has(email)) continue;
          seen.add(email);
          results.push({ email });
        }
      }
    } catch (err) {
      this.logger.warn(`Outlook messages: ${String(err)}`);
    }

    return results;
  }

  private async importFromMailRu(skipSupport: boolean): Promise<ParsedEmail[]> {
    const user = this.config.get<string>('MAILRU_EMAIL');
    const pass = this.config.get<string>('MAILRU_APP_PASSWORD');
    if (!user || !pass) {
      throw new Error('MAILRU_EMAIL and MAILRU_APP_PASSWORD not configured');
    }

    const client = new ImapFlow({
      host: 'imap.mail.ru',
      port: 993,
      secure: true,
      auth: { user, pass },
    });

    const results: ParsedEmail[] = [];
    const seen = new Set<string>();

    await client.connect();
    try {
      const lock = await client.getMailboxLock('INBOX');
      try {
        for await (const msg of client.fetch('1:200', {
          envelope: true,
        })) {
          const addrs = [
            ...(msg.envelope?.from ?? []),
            ...(msg.envelope?.to ?? []),
            ...(msg.envelope?.cc ?? []),
          ];
          for (const addr of addrs) {
            if (!addr.address) continue;
            const email = normalizeEmail(addr.address);
            if (skipSupport && shouldSkipEmail(email)) continue;
            if (seen.has(email)) continue;
            seen.add(email);
            results.push({ email, name: addr.name ?? undefined });
          }
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }

    return results;
  }
}
