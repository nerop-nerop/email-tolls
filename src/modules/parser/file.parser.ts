import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import {
  extractEmailsFromText,
  normalizeEmail,
  ParsedEmail,
  shouldSkipEmail,
} from './email-regex.util';

@Injectable()
export class FileParser {
  async parseBuffer(
    buffer: Buffer,
    filename: string,
    skipSupport = true,
  ): Promise<ParsedEmail[]> {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'xlsx' || ext === 'xls') {
      return this.parseExcel(buffer, skipSupport);
    }
    return this.parseText(buffer.toString('utf-8'), skipSupport);
  }

  private async parseExcel(
    buffer: Buffer,
    skipSupport: boolean,
  ): Promise<ParsedEmail[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const results: ParsedEmail[] = [];
    const seen = new Set<string>();

    for (const sheet of workbook.worksheets) {
      sheet.eachRow((row) => {
        const cells: string[] = [];
        row.eachCell((cell) => {
          const val = cell.text?.trim();
          if (val) cells.push(val);
        });
        const line = cells.join(' ');
        const emails = extractEmailsFromText(line);
        for (const raw of emails) {
          const email = normalizeEmail(raw);
          if (skipSupport && shouldSkipEmail(email)) continue;
          if (seen.has(email)) continue;
          seen.add(email);
          const nameCol = cells.find((c) => !c.includes('@'));
          results.push({ email, name: nameCol });
        }
      });
    }
    return results;
  }

  private parseText(text: string, skipSupport: boolean): ParsedEmail[] {
    const results: ParsedEmail[] = [];
    const seen = new Set<string>();
    for (const raw of extractEmailsFromText(text)) {
      const email = normalizeEmail(raw);
      if (skipSupport && shouldSkipEmail(email)) continue;
      if (seen.has(email)) continue;
      seen.add(email);
      results.push({ email });
    }
    return results;
  }
}
