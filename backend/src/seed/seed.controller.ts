import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('fake-data')
  @ApiOperation({ summary: 'Fill database with fake demo data' })
  @ApiResponse({ status: 201, description: 'Fake data created' })
  seedFakeData() {
    return this.seedService.seedFakeData();
  }
}
