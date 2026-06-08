import { IsOptional, IsString, MinLength } from 'class-validator';

export class GenerateEmailDto {
  @IsString()
  @MinLength(3)
  productDescription!: string;

  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
