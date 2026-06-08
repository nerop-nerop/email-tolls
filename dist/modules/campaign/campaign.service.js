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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const queue_service_1 = require("../../infrastructure/queue/queue.service");
const mail_sender_service_1 = require("./mail-sender.service");
let CampaignService = class CampaignService {
    prisma;
    mailSender;
    queue;
    config;
    constructor(prisma, mailSender, queue, config) {
        this.prisma = prisma;
        this.mailSender = mailSender;
        this.queue = queue;
        this.config = config;
    }
    onModuleInit() {
        this.queue.createSendWorker(async (job) => {
            const provider = job.data
                .sendProvider;
            await this.processSend(job, provider);
        });
    }
    async create(subject, bodyHtml) {
        return this.prisma.emailCampaign.create({
            data: { subject, bodyHtml, status: 'draft' },
        });
    }
    async list() {
        return this.prisma.emailCampaign.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async get(id) {
        return this.prisma.emailCampaign.findUnique({
            where: { id },
            include: { sendLogs: { include: { contact: true } } },
        });
    }
    personalize(template, contact) {
        return template
            .replace(/\{\{name\}\}/gi, contact.name ?? '')
            .replace(/\{\{company\}\}/gi, contact.company ?? '')
            .replace(/\{\{email\}\}/gi, contact.email);
    }
    async sendCampaign(campaignId, consentConfirmed, sendProvider) {
        if (!consentConfirmed) {
            throw new common_1.BadRequestException('Consent confirmation required before sending');
        }
        const campaign = await this.prisma.emailCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign) {
            throw new common_1.BadRequestException('Campaign not found');
        }
        const contacts = await this.prisma.emailContact.findMany({
            where: { isWorking: true },
        });
        const existingLogs = await this.prisma.emailSendLog.findMany({
            where: { campaignId },
            select: { contactId: true },
        });
        const sentSet = new Set(existingLogs.map((l) => l.contactId));
        const toSend = contacts.filter((c) => !sentSet.has(c.id));
        let queued = 0;
        for (const contact of toSend) {
            const log = await this.prisma.emailSendLog.create({
                data: {
                    campaignId,
                    contactId: contact.id,
                    status: 'pending',
                },
            });
            if (this.queue.sendQueue) {
                await this.queue.sendQueue.add('send', {
                    campaignId,
                    contactId: contact.id,
                    sendLogId: log.id,
                    sendProvider,
                });
                queued++;
            }
            else {
                await this.processSend({
                    data: {
                        campaignId,
                        contactId: contact.id,
                        sendLogId: log.id,
                    },
                }, sendProvider);
            }
        }
        await this.prisma.emailCampaign.update({
            where: { id: campaignId },
            data: { status: 'sending' },
        });
        return { total: toSend.length, queued };
    }
    async processSend(job, sendProvider) {
        const { campaignId, contactId, sendLogId } = job.data;
        const [campaign, contact] = await Promise.all([
            this.prisma.emailCampaign.findUnique({ where: { id: campaignId } }),
            this.prisma.emailContact.findUnique({ where: { id: contactId } }),
        ]);
        if (!campaign || !contact)
            return;
        const unsubscribeUrl = this.config.get('UNSUBSCRIBE_URL') ?? 'http://localhost:3001/unsubscribe';
        const body = this.personalize(campaign.bodyHtml, contact);
        const html = `${body}<hr><p style="font-size:12px;color:#666"><a href="${unsubscribeUrl}?email=${encodeURIComponent(contact.email)}">Отписаться</a></p>`;
        try {
            const provider = sendProvider ??
                this.config.get('EMAIL_SEND_PROVIDER', 'smtp');
            await this.mailSender.send(contact.email, campaign.subject, html, provider);
            await this.prisma.emailSendLog.update({
                where: { id: sendLogId },
                data: { status: 'sent', sentAt: new Date() },
            });
            await this.prisma.emailCampaign.update({
                where: { id: campaignId },
                data: { sentCount: { increment: 1 } },
            });
        }
        catch (err) {
            await this.prisma.emailSendLog.update({
                where: { id: sendLogId },
                data: { status: 'failed', error: String(err) },
            });
        }
    }
};
exports.CampaignService = CampaignService;
exports.CampaignService = CampaignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_sender_service_1.MailSenderService,
        queue_service_1.QueueService,
        config_1.ConfigService])
], CampaignService);
//# sourceMappingURL=campaign.service.js.map