"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailboxParser_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailboxParser = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const imapflow_1 = require("imapflow");
const googleapis_1 = require("googleapis");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const email_regex_util_1 = require("../parser/email-regex.util");
let MailboxParser = MailboxParser_1 = class MailboxParser {
    prisma;
    config;
    logger = new common_1.Logger(MailboxParser_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async importFromProvider(provider, skipSupport = true) {
        if (provider === 'gmail') {
            return this.importFromGmail(skipSupport);
        }
        if (provider === 'outlook') {
            return this.importFromOutlook(skipSupport);
        }
        return this.importFromMailRu(skipSupport);
    }
    async importFromGmail(skipSupport) {
        const token = await this.prisma.mailboxToken.findUnique({
            where: { provider: 'gmail' },
        });
        if (!token) {
            throw new Error('Gmail not connected. Visit /api/auth/google');
        }
        const oauth2 = new googleapis_1.google.auth.OAuth2(this.config.get('GOOGLE_CLIENT_ID'), this.config.get('GOOGLE_CLIENT_SECRET'));
        oauth2.setCredentials({
            access_token: token.accessToken,
            refresh_token: token.refreshToken ?? undefined,
        });
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth: oauth2 });
        const people = googleapis_1.google.people({ version: 'v1', auth: oauth2 });
        const results = [];
        const seen = new Set();
        try {
            const connections = await people.people.connections.list({
                resourceName: 'people/me',
                personFields: 'emailAddresses,names',
                pageSize: 500,
            });
            for (const person of connections.data.connections ?? []) {
                for (const ea of person.emailAddresses ?? []) {
                    if (!ea.value)
                        continue;
                    const email = (0, email_regex_util_1.normalizeEmail)(ea.value);
                    if (skipSupport && (0, email_regex_util_1.shouldSkipEmail)(email))
                        continue;
                    if (seen.has(email))
                        continue;
                    seen.add(email);
                    results.push({
                        email,
                        name: person.names?.[0]?.displayName ?? undefined,
                    });
                }
            }
        }
        catch (err) {
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
                    id: msg.id,
                    format: 'metadata',
                    metadataHeaders: ['From', 'To', 'Cc'],
                });
                for (const header of full.data.payload?.headers ?? []) {
                    if (!['From', 'To', 'Cc'].includes(header.name ?? ''))
                        continue;
                    for (const raw of (0, email_regex_util_1.extractEmailsFromText)(header.value ?? '')) {
                        const email = (0, email_regex_util_1.normalizeEmail)(raw);
                        if (skipSupport && (0, email_regex_util_1.shouldSkipEmail)(email))
                            continue;
                        if (seen.has(email))
                            continue;
                        seen.add(email);
                        results.push({ email });
                    }
                }
            }
        }
        catch (err) {
            this.logger.warn(`Gmail messages: ${String(err)}`);
        }
        return results;
    }
    async importFromOutlook(skipSupport) {
        const token = await this.prisma.mailboxToken.findUnique({
            where: { provider: 'outlook' },
        });
        if (!token) {
            throw new Error('Outlook not connected. Visit /api/auth/microsoft');
        }
        const client = microsoft_graph_client_1.Client.init({
            authProvider: (done) => done(null, token.accessToken),
        });
        const results = [];
        const seen = new Set();
        try {
            const contacts = await client.api('/me/contacts').top(500).get();
            for (const contact of contacts.value ?? []) {
                for (const ea of contact.emailAddresses ?? []) {
                    if (!ea.address)
                        continue;
                    const email = (0, email_regex_util_1.normalizeEmail)(ea.address);
                    if (skipSupport && (0, email_regex_util_1.shouldSkipEmail)(email))
                        continue;
                    if (seen.has(email))
                        continue;
                    seen.add(email);
                    results.push({
                        email,
                        name: contact.displayName,
                        company: contact.companyName,
                    });
                }
            }
        }
        catch (err) {
            this.logger.warn(`Outlook contacts: ${String(err)}`);
        }
        try {
            const messages = await client.api('/me/messages').top(100).select('from,toRecipients,ccRecipients').get();
            for (const msg of messages.value ?? []) {
                const addrs = [];
                if (msg.from?.emailAddress?.address)
                    addrs.push(msg.from.emailAddress.address);
                for (const r of msg.toRecipients ?? []) {
                    if (r.emailAddress?.address)
                        addrs.push(r.emailAddress.address);
                }
                for (const r of msg.ccRecipients ?? []) {
                    if (r.emailAddress?.address)
                        addrs.push(r.emailAddress.address);
                }
                for (const raw of addrs) {
                    const email = (0, email_regex_util_1.normalizeEmail)(raw);
                    if (skipSupport && (0, email_regex_util_1.shouldSkipEmail)(email))
                        continue;
                    if (seen.has(email))
                        continue;
                    seen.add(email);
                    results.push({ email });
                }
            }
        }
        catch (err) {
            this.logger.warn(`Outlook messages: ${String(err)}`);
        }
        return results;
    }
    async importFromMailRu(skipSupport) {
        const user = this.config.get('MAILRU_EMAIL');
        const pass = this.config.get('MAILRU_APP_PASSWORD');
        if (!user || !pass) {
            throw new Error('MAILRU_EMAIL and MAILRU_APP_PASSWORD not configured');
        }
        const client = new imapflow_1.ImapFlow({
            host: 'imap.mail.ru',
            port: 993,
            secure: true,
            auth: { user, pass },
        });
        const results = [];
        const seen = new Set();
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
                        if (!addr.address)
                            continue;
                        const email = (0, email_regex_util_1.normalizeEmail)(addr.address);
                        if (skipSupport && (0, email_regex_util_1.shouldSkipEmail)(email))
                            continue;
                        if (seen.has(email))
                            continue;
                        seen.add(email);
                        results.push({ email, name: addr.name ?? undefined });
                    }
                }
            }
            finally {
                lock.release();
            }
        }
        finally {
            await client.logout();
        }
        return results;
    }
};
exports.MailboxParser = MailboxParser;
exports.MailboxParser = MailboxParser = MailboxParser_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], MailboxParser);
//# sourceMappingURL=mailbox.parser.js.map