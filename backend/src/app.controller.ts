import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
@Controller('health')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db')
  async checkDb() {
    try {
      await this.prisma.$queryRaw<any>`SELECT 1`;
      return { status: 'ok', message: 'Database connected!' };
    } catch (e: unknown) {
      return { status: 'error', message: (e as Error).message };
    }
  }
}
