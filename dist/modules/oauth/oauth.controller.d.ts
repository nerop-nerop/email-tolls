import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class OAuthController {
    private readonly config;
    private readonly prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    googleAuth(res: Response): void;
    googleCallback(code: string, res: Response): Promise<void>;
    microsoftAuth(res: Response): Promise<void>;
    microsoftCallback(code: string, res: Response): Promise<void>;
    status(): Promise<{
        connected: {
            email: string | null;
            provider: string;
            expiresAt: Date | null;
        }[];
    }>;
    private createGoogleClient;
    private createMsalClient;
}
//# sourceMappingURL=oauth.controller.d.ts.map