import { Module } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module';
import { ValidatorModule } from '../validator/validator.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [ParserModule, ValidatorModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
