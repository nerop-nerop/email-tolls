import { Module } from '@nestjs/common';
import { ParserModule } from '../parser/parser.module';
import { MailboxController } from './mailbox.controller';
import { MailboxParser } from './mailbox.parser';

@Module({
  imports: [ParserModule],
  controllers: [MailboxController],
  providers: [MailboxParser],
  exports: [MailboxParser],
})
export class MailboxModule {}
