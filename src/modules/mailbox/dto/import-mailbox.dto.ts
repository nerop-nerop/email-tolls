import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class ImportMailboxDto {
  @IsIn(['gmail', 'outlook', 'mailru'])
  provider!: 'gmail' | 'outlook' | 'mailru';

  @IsOptional()
  @IsBoolean()
  skipSupport?: boolean;
}
