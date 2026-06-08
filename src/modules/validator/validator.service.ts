import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { QueueService, ValidateJobData } from '../../infrastructure/queue/queue.service';
import { EmailValidatorService } from './email-validator.service';

@Injectable()
export class ValidatorService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailValidator: EmailValidatorService,
    private readonly queue: QueueService,
  ) {}

  onModuleInit(): void {
    this.queue.createValidateWorker(async (job) => {
      await this.processContact(job);
    });
  }

  async validateAllPending(): Promise<{ queued: number; processed: number }> {
    const pending = await this.prisma.emailContact.findMany({
      where: { status: 'pending' },
      select: { id: true },
    });

    if (this.queue.validateQueue) {
      for (const contact of pending) {
        await this.queue.validateQueue.add('validate', { contactId: contact.id });
      }
      return { queued: pending.length, processed: 0 };
    }

    for (const contact of pending) {
      await this.processContact({ data: { contactId: contact.id } } as Job<ValidateJobData>);
    }
    return { queued: 0, processed: pending.length };
  }

  async validateContact(contactId: string): Promise<void> {
    if (this.queue.validateQueue) {
      await this.queue.validateQueue.add('validate', { contactId });
      return;
    }
    await this.processContact({ data: { contactId } } as Job<ValidateJobData>);
  }

  private async processContact(job: Job<ValidateJobData>): Promise<void> {
    const contact = await this.prisma.emailContact.findUnique({
      where: { id: job.data.contactId },
    });
    if (!contact) return;

    const result = await this.emailValidator.validate(contact.email);
    await this.prisma.emailContact.update({
      where: { id: contact.id },
      data: {
        status: result.status,
        isWorking: result.isWorking,
        checkedAt: new Date(),
        lastError: result.lastError,
      },
    });
  }
}
