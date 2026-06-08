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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailSenderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let MailSenderService = class MailSenderService {
    config;
    prisma;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
    }
    async send(to, subject, bodyHtml, provider) {
        const resolvedProvider = provider ?? this.config.get('EMAIL_SEND_PROVIDER', 'smtp');
        if (resolvedProvider === 'gmail') {
            await this.sendViaGmail(to, subject, bodyHtml);
            return;
        }
        if (resolvedProvider === 'outlook') {
            await this.sendViaOutlook(to, subject, bodyHtml);
            return;
        }
        await this.sendViaSmtp(to, subject, bodyHtml);
    }
    async sendViaSmtp(to, subject, bodyHtml) {
        const host = this.config.get('SMTP_HOST', 'smtp.mail.ru');
        const port = Number(this.config.get('SMTP_PORT', 465));
        const user = this.config.get('SMTP_USER') ?? this.config.get('MAILRU_EMAIL');
        const pass = this.config.get('SMTP_PASS') ?? this.config.get('MAILRU_APP_PASSWORD');
        if (!user || !pass) {
            throw new Error('SMTP credentials not configured');
        }
        const transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
        await transporter.sendMail({
            from: user,
            to,
            subject,
            html: bodyHtml,
        });
    }
    async sendViaGmail(to, subject, bodyHtml) {
        const token = await this.prisma.mailboxToken.findUnique({
            where: { provider: 'gmail' },
        });
        if (!token) {
            throw new Error('Gmail not connected');
        }
        const oauth2 = new googleapis_1.google.auth.OAuth2(this.config.get('GOOGLE_CLIENT_ID'), this.config.get('GOOGLE_CLIENT_SECRET'));
        oauth2.setCredentials({
            access_token: token.accessToken,
            refresh_token: token.refreshToken ?? undefined,
        });
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth: oauth2 });
        const from = token.email ?? 'me';
        const raw = this.buildRawMessage(from, to, subject, bodyHtml);
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw },
        });
    }
    async sendViaOutlook(to, subject, bodyHtml) {
        const token = await this.prisma.mailboxToken.findUnique({
            where: { provider: 'outlook' },
        });
        if (!token) {
            throw new Error('Outlook not connected');
        }
        const client = microsoft_graph_client_1.Client.init({
            authProvider: (done) => done(null, token.accessToken),
        });
        await client.api('/me/sendMail').post({
            message: {
                subject,
                body: { contentType: 'HTML', content: bodyHtml },
                toRecipients: [{ emailAddress: { address: to } }],
            },
        });
    }
    buildRawMessage(from, to, subject, bodyHtml) {
        const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            bodyHtml,
        ].join('\r\n');
        return Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
};
exports.MailSenderService = MailSenderService;
exports.MailSenderService = MailSenderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], MailSenderService);
//# sourceMappingURL=mail-sender.service.js.map