import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@messenger/database';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
//# sourceMappingURL=prisma.service.d.ts.map