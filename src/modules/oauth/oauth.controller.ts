import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { google } from 'googleapis';
import * as msal from '@azure/msal-node';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Controller('auth')
export class OAuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('google')
  googleAuth(@Res() res: Response) {
    const oauth2 = this.createGoogleClient();
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });
    res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    const oauth2 = this.createGoogleClient();
    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);

    const oauth2Api = google.oauth2({ version: 'v2', auth: oauth2 });
    const userInfo = await oauth2Api.userinfo.get();

    await this.prisma.mailboxToken.upsert({
      where: { provider: 'gmail' },
      create: {
        provider: 'gmail',
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        email: userInfo.data.email ?? undefined,
      },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        email: userInfo.data.email ?? undefined,
      },
    });

    res.redirect('/?connected=gmail');
  }

  @Get('microsoft')
  async microsoftAuth(@Res() res: Response) {
    const client = this.createMsalClient();
    const redirectUri = this.config.get(
      'MICROSOFT_REDIRECT_URI',
      'http://localhost:3001/api/auth/microsoft/callback',
    );
    const url = await client.getAuthCodeUrl({
      scopes: [
        'openid',
        'profile',
        'email',
        'offline_access',
        'Mail.Send',
        'Mail.Read',
        'Contacts.Read',
      ],
      redirectUri,
    });
    res.redirect(url);
  }

  @Get('microsoft/callback')
  async microsoftCallback(@Query('code') code: string, @Res() res: Response) {
    const client = this.createMsalClient();
    const redirectUri = this.config.get(
      'MICROSOFT_REDIRECT_URI',
      'http://localhost:3001/api/auth/microsoft/callback',
    );
    const result = await client.acquireTokenByCode({
      code,
      scopes: [
        'openid',
        'profile',
        'email',
        'offline_access',
        'Mail.Send',
        'Mail.Read',
        'Contacts.Read',
      ],
      redirectUri,
    });

    await this.prisma.mailboxToken.upsert({
      where: { provider: 'outlook' },
      create: {
        provider: 'outlook',
        accessToken: result.accessToken,
        expiresAt: result.expiresOn ?? null,
        email: result.account?.username,
      },
      update: {
        accessToken: result.accessToken,
        expiresAt: result.expiresOn ?? null,
        email: result.account?.username,
      },
    });

    res.redirect('/?connected=outlook');
  }

  @Get('status')
  async status() {
    const tokens = await this.prisma.mailboxToken.findMany({
      select: { provider: true, email: true, expiresAt: true },
    });
    return { connected: tokens };
  }

  private createGoogleClient() {
    const redirectUri = this.config.get(
      'GOOGLE_REDIRECT_URI',
      'http://localhost:3001/api/auth/google/callback',
    );
    return new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
      redirectUri,
    );
  }

  private createMsalClient() {
    const clientId = this.config.get('MICROSOFT_CLIENT_ID');
    const clientSecret = this.config.get('MICROSOFT_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new Error('Microsoft OAuth not configured');
    }
    return new msal.ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: 'https://login.microsoftonline.com/common',
      },
    });
  }
}
