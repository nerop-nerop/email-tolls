import { ParserService } from '../parser/parser.service';
import { ValidatorService } from '../validator/validator.service';
import { ImportUrlsDto } from './dto/import-urls.dto';
import { ContactsService } from './contacts.service';
export declare class ContactsController {
    private readonly parser;
    private readonly validator;
    private readonly contacts;
    constructor(parser: ParserService, validator: ValidatorService, contacts: ContactsService);
    list(isWorking?: string, source?: string, status?: string): Promise<{
        name: string | null;
        id: string;
        email: string;
        source: string;
        sourceDetail: string | null;
        status: string;
        isWorking: boolean | null;
        checkedAt: Date | null;
        lastError: string | null;
        company: string | null;
        createdAt: Date;
    }[]>;
    stats(): Promise<{
        total: number;
        working: number;
        pending: number;
        invalid: number;
    }>;
    importFile(file: Express.Multer.File): Promise<import("../parser/parser.service").ImportResult | {
        error: string;
    }>;
    importUrls(dto: ImportUrlsDto): Promise<import("../parser/parser.service").ImportResult>;
    validate(): Promise<{
        queued: number;
        processed: number;
    }>;
}
//# sourceMappingURL=contacts.controller.d.ts.map