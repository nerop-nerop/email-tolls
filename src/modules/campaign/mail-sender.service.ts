import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class MailSenderService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async send(
    to: string,
    subject: string,
    bodyHtml: string,
    provider?: string,
  ): Promise<void> {
    const resolvedProvider =
      provider ?? this.config.get<string>('EMAIL_SEND_PROVIDER', 'smtp');

    if (resolvedProvider === 'gmail') {
      await this.sendViaGmail(to, subject, bodyHtml);
      return;
    }
    if (resolvedProvider === 'outlook') {
      await this.sendViaOutlook(to, subject, bodyHtml);
      return;
    }
    await this.sendViaSmtp(to, subject, bodyHtml);
  }

  private async sendViaSmtp(
    to: string,
    subject: string,
    bodyHtml: string,
  ): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST', 'smtp.mail.ru');
    const port = Number(this.config.get('SMTP_PORT', 465));
    const user = this.config.get<string>('SMTP_USER') ?? this.config.get('MAILRU_EMAIL');
    const pass = this.config.get<string>('SMTP_PASS') ?? this.config.get('MAILRU_APP_PASSWORD');

    if (!user || !pass) {
      throw new Error('SMTP credentials not configured');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: user,
      to,
      subject,
      html: bodyHtml,
    });
  }

  private async sendViaGmail(
    to: string,
    subject: string,
    bodyHtml: string,
  ): Promise<void> {
    const token = await this.prisma.mailboxToken.findUnique({
      where: { provider: 'gmail' },
    });
    if (!token) {
      throw new Error('Gmail not connected');
    }

    const oauth2 = new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
    );
    oauth2.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken ?? undefined,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2 });
    const from = token.email ?? 'me';
    const raw = this.buildRawMessage(from, to, subject, bodyHtml);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
  }

  private async sendViaOutlook(
    to: string,
    subject: string,
    bodyHtml: string,
  ): Promise<void> {
    const token = await this.prisma.mailboxToken.findUnique({
      where: { provider: 'outlook' },
    });
    if (!token) {
      throw new Error('Outlook not connected');
    }

    const client = Client.init({
      authProvider: (done) => done(null, token.accessToken),
    });

    await client.api('/me/sendMail').post({
      message: {
        subject,
        body: { contentType: 'HTML', content: bodyHtml },
        toRecipients: [{ emailAddress: { address: to } }],
      },
    });
  }

  private buildRawMessage(
    from: string,
    to: string,
    subject: string,
    bodyHtml: string,
  ): string {
    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      bodyHtml,
    ].join('\r\n');
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
