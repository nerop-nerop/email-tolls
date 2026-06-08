import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { MailSenderService } from './mail-sender.service';
export declare class CampaignService implements OnModuleInit {
    private readonly prisma;
    private readonly mailSender;
    private readonly queue;
    private readonly config;
    constructor(prisma: PrismaService, mailSender: MailSenderService, queue: QueueService, config: ConfigService);
    onModuleInit(): void;
    create(subject: string, bodyHtml: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        subject: string;
        bodyHtml: string;
        sentCount: number;
    }>;
    list(): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        subject: string;
        bodyHtml: string;
        sentCount: number;
    }[]>;
    get(id: string): Promise<({
        sendLogs: ({
            contact: {
                name: string | null;
                id: string;
                email: string;
                source: string;
                sourceDetail: string | null;
                status: string;
                isWorking: boolean | null;
                checkedAt: Date | null;
                lastError: string | null;
                company: string | null;
                createdAt: Date;
            };
        } & {
            error: string | null;
            id: string;
            status: string;
            createdAt: Date;
            campaignId: string;
            contactId: string;
            sentAt: Date | null;
        })[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        subject: string;
        bodyHtml: string;
        sentCount: number;
    }) | null>;
    personalize(template: string, contact: {
        name?: string | null;
        company?: string | null;
        email: string;
    }): string;
    sendCampaign(campaignId: string, consentConfirmed: boolean, sendProvider?: string): Promise<{
        total: number;
        queued: number;
    }>;
    private processSend;
}
//# sourceMappingURL=campaign.service.d.ts.map