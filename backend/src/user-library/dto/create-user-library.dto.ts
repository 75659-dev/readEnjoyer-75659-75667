import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReadingStatus } from '@prisma/client';

export class CreateUserLibraryDto {
  @ApiPropertyOptional({
    enum: ReadingStatus,
    description: 'Reading status (default: WANT_TO_READ)',
    example: 'WANT_TO_READ',
  })
  @IsOptional()
  @IsEnum(ReadingStatus, {
    message: 'Status must be one of: WANT_TO_READ, READING, READ',
  })
  status?: ReadingStatus;

  @ApiPropertyOptional({
    description: 'Initial number of pages read',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  pagesRead?: number;
}
