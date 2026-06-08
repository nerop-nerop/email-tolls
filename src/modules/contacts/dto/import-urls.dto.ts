import { IsArray, IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class ImportUrlsDto {
  @IsArray()
  @IsUrl({}, { each: true })
  urls!: string[];

  @IsOptional()
  @IsBoolean()
  skipSupport?: boolean;
}
