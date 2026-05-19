import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Stephen King', description: 'Name of the author' })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'American author of horror...',
    description: 'Biography of the author',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/king.jpg',
    description: 'URL to author photo',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}
