import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters?: {
    isWorking?: boolean;
    source?: string;
    status?: string;
  }) {
    return this.prisma.emailContact.findMany({
      where: {
        ...(filters?.isWorking !== undefined && { isWorking: filters.isWorking }),
        ...(filters?.source && { source: filters.source }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async stats() {
    const [total, working, pending, invalid] = await Promise.all([
      this.prisma.emailContact.count(),
      this.prisma.emailContact.count({ where: { isWorking: true } }),
      this.prisma.emailContact.count({ where: { status: 'pending' } }),
      this.prisma.emailContact.count({ where: { status: 'invalid' } }),
    ]);
    return { total, working, pending, invalid };
  }
}
