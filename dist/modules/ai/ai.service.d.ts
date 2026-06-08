import { ConfigService } from '@nestjs/config';
export interface GeneratedEmail {
    subject: string;
    bodyHtml: string;
}
export declare class AiService {
    private readonly config;
    private openai;
    constructor(config: ConfigService);
    generateEmail(productDescription: string, tone?: string, language?: string): Promise<GeneratedEmail>;
    private fallbackGenerate;
}
//# sourceMappingURL=ai.service.d.ts.map