import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue, Worker } from 'bullmq';

export type ValidateJobData = { contactId: string };
export type SendJobData = { campaignId: string; contactId: string; sendLogId: string };

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection: { host: string; port: number } | null;
  readonly validateQueue: Queue<ValidateJobData> | null;
  readonly sendQueue: Queue<SendJobData> | null;
  private workers: Worker[] = [];

  constructor(private readonly config: ConfigService) {
    const enabled = config.get<string>('REDIS_ENABLED', 'true') !== 'false';

    if (enabled) {
      const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
      const parsed = new URL(redisUrl);
      this.connection = {
        host: parsed.hostname || 'localhost',
        port: Number(parsed.port || 6379),
      };
      this.validateQueue = new Queue<ValidateJobData>('email-validate', {
        connection: this.connection,
      });
      this.sendQueue = new Queue<SendJobData>('email-send', {
        connection: this.connection,
      });
    } else {
      this.connection = null;
      this.validateQueue = null;
      this.sendQueue = null;
    }
  }

  createValidateWorker(
    processor: (job: Job<ValidateJobData>) => Promise<void>,
  ): Worker<ValidateJobData> | null {
    if (!this.connection) return null;
    const concurrency = Number(
      this.config.get('EMAIL_VALIDATE_CONCURRENCY', 10),
    );
    const worker = new Worker<ValidateJobData>('email-validate', processor, {
      connection: this.connection,
      concurrency,
    });
    this.workers.push(worker);
    return worker;
  }

  createSendWorker(
    processor: (job: Job<SendJobData>) => Promise<void>,
  ): Worker<SendJobData> | null {
    if (!this.connection) return null;
    const worker = new Worker<SendJobData>('email-send', processor, {
      connection: this.connection,
      concurrency: 1,
      limiter: {
        max: 1,
        duration: Number(this.config.get('EMAIL_SEND_DELAY_MS', 3000)),
      },
    });
    this.workers.push(worker);
    return worker;
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.close()));
    await this.validateQueue?.close();
    await this.sendQueue?.close();
  }
}
