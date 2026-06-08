import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { MailSenderService } from './mail-sender.service';

@Module({
  controllers: [CampaignController],
  providers: [CampaignService, MailSenderService],
  exports: [CampaignService, MailSenderService],
})
export class CampaignModule {}
