import { CampaignService } from './campaign.service';
import { CreateCampaignDto, SendCampaignDto } from './dto/create-campaign.dto';
export declare class CampaignController {
    private readonly campaigns;
    constructor(campaigns: CampaignService);
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
    create(dto: CreateCampaignDto): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        subject: string;
        bodyHtml: string;
        sentCount: number;
    }>;
    send(id: string, dto: SendCampaignDto): Promise<{
        total: number;
        queued: number;
    }>;
}
//# sourceMappingURL=campaign.controller.d.ts.map