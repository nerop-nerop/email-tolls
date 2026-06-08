import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ExcelExporter } from './excel.exporter';

@Controller('contacts')
export class ExportController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exporter: ExcelExporter,
  ) {}

  @Get('export')
  async export(
    @Res() res: Response,
    @Query('isWorking') isWorking?: string,
    @Query('source') source?: string,
  ) {
    const contacts = await this.prisma.emailContact.findMany({
      where: {
        ...(isWorking === 'true' && { isWorking: true }),
        ...(isWorking === 'false' && { isWorking: false }),
        ...(source && { source }),
      },
      orderBy: { createdAt: 'desc' },
    });

    const buffer = await this.exporter.exportContacts(contacts);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="contacts_${date}.xlsx"`,
    );
    res.send(buffer);
  }
}
