import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { FileParser } from './file.parser';
import { HtmlParser } from './html.parser';
import { ParsedEmail } from './email-regex.util';

export interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
}

@Injectable()
export class ParserService {
  constructor(
    private readonly fileParser: FileParser,
    private readonly htmlParser: HtmlParser,
    private readonly prisma: PrismaService,
  ) {}

  async importFromFile(
    buffer: Buffer,
    filename: string,
    skipSupport = true,
  ): Promise<ImportResult> {
    const parsed = await this.fileParser.parseBuffer(buffer, filename, skipSupport);
    return this.saveContacts(parsed, 'file', filename);
  }

  async importFromUrls(
    urls: string[],
    skipSupport = true,
  ): Promise<ImportResult> {
    const parsed = await this.htmlParser.parseUrls(urls, skipSupport);
    return this.saveContacts(parsed, 'url', urls.join(', '));
  }

  async saveContacts(
    items: ParsedEmail[],
    source: string,
    sourceDetail?: string,
  ): Promise<ImportResult> {
    let imported = 0;
    let skipped = 0;

    for (const item of items) {
      try {
        await this.prisma.emailContact.create({
          data: {
            email: item.email,
            source,
            sourceDetail: item.company ?? sourceDetail,
            name: item.name,
            company: item.company,
            status: 'pending',
          },
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    return { imported, skipped, total: items.length };
  }
}
