export interface ParsedEmail {
    email: string;
    name?: string;
    company?: string;
}
export declare function extractEmailsFromText(text: string): string[];
export declare function shouldSkipEmail(email: string, skipPrefixes?: string[]): boolean;
export declare function normalizeEmail(email: string): string;
//# sourceMappingURL=email-regex.util.d.ts.map