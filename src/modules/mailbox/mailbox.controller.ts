import { Body, Controller, Post } from '@nestjs/common';
import { ParserService } from '../parser/parser.service';
import { MailboxParser } from './mailbox.parser';
import { ImportMailboxDto } from './dto/import-mailbox.dto';

@Controller('contacts/import')
export class MailboxController {
  constructor(
    private readonly mailboxParser: MailboxParser,
    private readonly parser: ParserService,
  ) {}

  @Post('mailbox')
  async importMailbox(@Body() dto: ImportMailboxDto) {
    const parsed = await this.mailboxParser.importFromProvider(
      dto.provider,
      dto.skipSupport ?? true,
    );
    return this.parser.saveContacts(parsed, dto.provider);
  }
}
