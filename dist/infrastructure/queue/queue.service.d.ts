import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';
export type ValidateJobData = {
    contactId: string;
};
export type SendJobData = {
    campaignId: string;
    contactId: string;
    sendLogId: string;
};
export declare class QueueService implements OnModuleDestroy {
    private readonly config;
    private readonly connection;
    readonly validateQueue: Queue<ValidateJobData> | null;
    readonly sendQueue: Queue<SendJobData> | null;
    private workers;
    constructor(config: ConfigService);
    createValidateWorker(processor: (job: Job<ValidateJobData>) => Promise<void>): Worker<ValidateJobData> | null;
    createSendWorker(processor: (job: Job<SendJobData>) => Promise<void>): Worker<SendJobData> | null;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=queue.service.d.ts.map