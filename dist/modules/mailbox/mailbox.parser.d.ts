import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ParsedEmail } from '../parser/email-regex.util';
export declare class MailboxParser {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    importFromProvider(provider: 'gmail' | 'outlook' | 'mailru', skipSupport?: boolean): Promise<ParsedEmail[]>;
    private importFromGmail;
    private importFromOutlook;
    private importFromMailRu;
}
//# sourceMappingURL=mailbox.parser.d.ts.map