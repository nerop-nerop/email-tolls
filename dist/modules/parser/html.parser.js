"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var HtmlParser_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlParser = void 0;
const common_1 = require("@nestjs/common");
const cheerio = __importStar(require("cheerio"));
const email_regex_util_1 = require("./email-regex.util");
let HtmlParser = HtmlParser_1 = class HtmlParser {
    logger = new common_1.Logger(HtmlParser_1.name);
    async parseUrls(urls, skipSupport = true) {
        const results = [];
        const seen = new Set();
        for (const url of urls) {
            try {
                const allowed = await this.isAllowedByRobots(url);
                if (!allowed) {
                    this.logger.warn(`Blocked by robots.txt: ${url}`);
                    continue;
                }
                const emails = await this.fetchEmailsFromUrl(url, skipSupport);
                for (const item of emails) {
                    if (seen.has(item.email))
                        continue;
                    seen.add(item.email);
                    results.push(item);
                }
            }
            catch (err) {
                this.logger.warn(`Failed to parse ${url}: ${String(err)}`);
            }
        }
        return results;
    }
    async fetchEmailsFromUrl(url, skipSupport) {
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
        const mailtoLinks = [];
        $('a[href^="mailto:"]').each((_, el) => {
            const href = $(el).attr('href') ?? '';
            const addr = href.replace(/^mailto:/i, '').split('?')[0];
            if (addr)
                mailtoLinks.push(addr);
        });
        const allText = `${text} ${mailtoLinks.join(' ')}`;
        const emails = (0, email_regex_util_1.extractEmailsFromText)(allText);
        return emails
            .map((e) => (0, email_regex_util_1.normalizeEmail)(e))
            .filter((e) => !(skipSupport && (0, email_regex_util_1.shouldSkipEmail)(e)))
            .map((email) => ({ email, company: new URL(url).hostname }));
    }
    async isAllowedByRobots(url) {
        try {
            const parsed = new URL(url);
            const robotsUrl = `${parsed.origin}/robots.txt`;
            const res = await fetch(robotsUrl, {
                signal: AbortSignal.timeout(5_000),
            });
            if (!res.ok)
                return true;
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
                    if (rule && path.startsWith(rule))
                        return false;
                }
            }
            return true;
        }
        catch {
            return true;
        }
    }
};
exports.HtmlParser = HtmlParser;
exports.HtmlParser = HtmlParser = HtmlParser_1 = __decorate([
    (0, common_1.Injectable)()
], HtmlParser);
//# sourceMappingURL=html.parser.js.map