import { Response } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ExcelExporter } from './excel.exporter';
export declare class ExportController {
    private readonly prisma;
    private readonly exporter;
    constructor(prisma: PrismaService, exporter: ExcelExporter);
    export(res: Response, isWorking?: string, source?: string): Promise<void>;
}
//# sourceMappingURL=export.controller.d.ts.map