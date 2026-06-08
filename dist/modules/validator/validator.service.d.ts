import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { EmailValidatorService } from './email-validator.service';
export declare class ValidatorService implements OnModuleInit {
    private readonly prisma;
    private readonly emailValidator;
    private readonly queue;
    constructor(prisma: PrismaService, emailValidator: EmailValidatorService, queue: QueueService);
    onModuleInit(): void;
    validateAllPending(): Promise<{
        queued: number;
        processed: number;
    }>;
    validateContact(contactId: string): Promise<void>;
    private processContact;
}
//# sourceMappingURL=validator.service.d.ts.map