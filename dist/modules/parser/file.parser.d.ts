import { ParsedEmail } from './email-regex.util';
export declare class FileParser {
    parseBuffer(buffer: Buffer, filename: string, skipSupport?: boolean): Promise<ParsedEmail[]>;
    private parseExcel;
    private parseText;
}
//# sourceMappingURL=file.parser.d.ts.map