import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class MailSenderService {
    private readonly config;
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    send(to: string, subject: string, bodyHtml: string, provider?: string): Promise<void>;
    private sendViaSmtp;
    private sendViaGmail;
    private sendViaOutlook;
    private buildRawMessage;
}
//# sourceMappingURL=mail-sender.service.d.ts.map