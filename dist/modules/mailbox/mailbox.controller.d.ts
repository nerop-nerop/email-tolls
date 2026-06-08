import { ParserService } from '../parser/parser.service';
import { MailboxParser } from './mailbox.parser';
import { ImportMailboxDto } from './dto/import-mailbox.dto';
export declare class MailboxController {
    private readonly mailboxParser;
    private readonly parser;
    constructor(mailboxParser: MailboxParser, parser: ParserService);
    importMailbox(dto: ImportMailboxDto): Promise<import("../parser/parser.service").ImportResult>;
}
//# sourceMappingURL=mailbox.controller.d.ts.map