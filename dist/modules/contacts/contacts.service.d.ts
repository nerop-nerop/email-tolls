import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class ContactsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters?: {
        isWorking?: boolean;
        source?: string;
        status?: string;
    }): Promise<{
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
}
//# sourceMappingURL=contacts.service.d.ts.map