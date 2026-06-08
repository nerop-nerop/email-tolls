import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MinLength(1)
  subject!: string;

  @IsString()
  @MinLength(1)
  bodyHtml!: string;
}

export class SendCampaignDto {
  @IsBoolean()
  consentConfirmed!: boolean;

  @IsOptional()
  @IsString()
  provider?: string;
}
