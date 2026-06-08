import { ParsedEmail } from './email-regex.util';
export declare class HtmlParser {
    private readonly logger;
    parseUrls(urls: string[], skipSupport?: boolean): Promise<ParsedEmail[]>;
    private fetchEmailsFromUrl;
    private isAllowedByRobots;
}
//# sourceMappingURL=html.parser.d.ts.map