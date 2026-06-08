import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { EmailContact } from '@prisma/client';

@Injectable()
export class ExcelExporter {
  async exportContacts(contacts: EmailContact[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Contacts');

    sheet.columns = [
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Source Detail', key: 'sourceDetail', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Is Working', key: 'isWorking', width: 12 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Checked At', key: 'checkedAt', width: 22 },
      { header: 'Last Error', key: 'lastError', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 22 },
    ];

    for (const c of contacts) {
      sheet.addRow({
        email: c.email,
        source: c.source,
        sourceDetail: c.sourceDetail ?? '',
        status: c.status,
        isWorking: c.isWorking === null ? 'неизвестно' : c.isWorking ? 'да' : 'нет',
        name: c.name ?? '',
        company: c.company ?? '',
        checkedAt: c.checkedAt?.toISOString() ?? '',
        lastError: c.lastError ?? '',
        createdAt: c.createdAt.toISOString(),
      });
    }

    sheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
