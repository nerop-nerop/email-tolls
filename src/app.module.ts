import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ParserModule } from './modules/parser/parser.module';
import { ValidatorModule } from './modules/validator/validator.module';
import { ExportModule } from './modules/export/export.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { AiModule } from './modules/ai/ai.module';
import { MailboxModule } from './modules/mailbox/mailbox.module';
import { OAuthModule } from './modules/oauth/oauth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QueueModule,
    ParserModule,
    ValidatorModule,
    ContactsModule,
    ExportModule,
    CampaignModule,
    AiModule,
    MailboxModule,
    OAuthModule,
  ],
})
export class AppModule {}
