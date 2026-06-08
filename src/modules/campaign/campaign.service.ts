import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { QueueService, SendJobData } from '../../infrastructure/queue/queue.service';
import { MailSenderService } from './mail-sender.service';

@Injectable()
export class CampaignService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailSender: MailSenderService,
    private readonly queue: QueueService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    this.queue.createSendWorker(async (job) => {
      const provider = (job.data as SendJobData & { sendProvider?: string })
        .sendProvider;
      await this.processSend(job, provider);
    });
  }

  async create(subject: string, bodyHtml: string) {
    return this.prisma.emailCampaign.create({
      data: { subject, bodyHtml, status: 'draft' },
    });
  }

  async list() {
    return this.prisma.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    return this.prisma.emailCampaign.findUnique({
      where: { id },
      include: { sendLogs: { include: { contact: true } } },
    });
  }

  personalize(template: string, contact: { name?: string | null; company?: string | null; email: string }): string {
    return template
      .replace(/\{\{name\}\}/gi, contact.name ?? '')
      .replace(/\{\{company\}\}/gi, contact.company ?? '')
      .replace(/\{\{email\}\}/gi, contact.email);
  }

  async sendCampaign(
    campaignId: string,
    consentConfirmed: boolean,
    sendProvider?: string,
  ) {
    if (!consentConfirmed) {
      throw new BadRequestException(
        'Consent confirmation required before sending',
      );
    }

    const campaign = await this.prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new BadRequestException('Campaign not found');
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
        } as SendJobData & { sendProvider?: string });
        queued++;
      } else {
        await this.processSend(
          {
            data: {
              campaignId,
              contactId: contact.id,
              sendLogId: log.id,
            },
          } as Job<SendJobData>,
          sendProvider,
        );
      }
    }

    await this.prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'sending' },
    });

    return { total: toSend.length, queued };
  }

  private async processSend(
    job: Job<SendJobData>,
    sendProvider?: string,
  ): Promise<void> {
    const { campaignId, contactId, sendLogId } = job.data;
    const [campaign, contact] = await Promise.all([
      this.prisma.emailCampaign.findUnique({ where: { id: campaignId } }),
      this.prisma.emailContact.findUnique({ where: { id: contactId } }),
    ]);

    if (!campaign || !contact) return;

    const unsubscribeUrl =
      this.config.get('UNSUBSCRIBE_URL') ?? 'http://localhost:3001/unsubscribe';
    const body = this.personalize(campaign.bodyHtml, contact);
    const html = `${body}<hr><p style="font-size:12px;color:#666"><a href="${unsubscribeUrl}?email=${encodeURIComponent(contact.email)}">Отписаться</a></p>`;

    try {
      const provider =
        sendProvider ??
        this.config.get<string>('EMAIL_SEND_PROVIDER', 'smtp');
      await this.mailSender.send(contact.email, campaign.subject, html, provider);
      await this.prisma.emailSendLog.update({
        where: { id: sendLogId },
        data: { status: 'sent', sentAt: new Date() },
      });
      await this.prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { sentCount: { increment: 1 } },
      });
    } catch (err) {
      await this.prisma.emailSendLog.update({
        where: { id: sendLogId },
        data: { status: 'failed', error: String(err) },
      });
    }
  }
}
