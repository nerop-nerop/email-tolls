import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto, SendCampaignDto } from './dto/create-campaign.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaigns: CampaignService) {}

  @Get()
  list() {
    return this.campaigns.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.campaigns.get(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaigns.create(dto.subject, dto.bodyHtml);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @Body() dto: SendCampaignDto) {
    return this.campaigns.sendCampaign(id, dto.consentConfirmed, dto.provider);
  }
}
