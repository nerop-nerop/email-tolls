import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { FileParser } from './file.parser';
import { HtmlParser } from './html.parser';
import { ParsedEmail } from './email-regex.util';
export interface ImportResult {
    imported: number;
    skipped: number;
    total: number;
}
export declare class ParserService {
    private readonly fileParser;
    private readonly htmlParser;
    private readonly prisma;
    constructor(fileParser: FileParser, htmlParser: HtmlParser, prisma: PrismaService);
    importFromFile(buffer: Buffer, filename: string, skipSupport?: boolean): Promise<ImportResult>;
    importFromUrls(urls: string[], skipSupport?: boolean): Promise<ImportResult>;
    saveContacts(items: ParsedEmail[], source: string, sourceDetail?: string): Promise<ImportResult>;
}
//# sourceMappingURL=parser.service.d.ts.map