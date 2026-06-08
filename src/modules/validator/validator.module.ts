import { Module } from '@nestjs/common';
import { EmailValidatorService } from './email-validator.service';
import { ValidatorService } from './validator.service';

@Module({
  providers: [EmailValidatorService, ValidatorService],
  exports: [EmailValidatorService, ValidatorService],
})
export class ValidatorModule {}
