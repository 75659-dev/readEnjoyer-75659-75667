import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'The Shining', description: 'Title of the book' })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'A horror novel...',
    description: 'Description of the book',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 19.99, description: 'Price of the book' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 50, description: 'Number of books in stock' })
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: 1, description: 'ID of the author' })
  @IsNumber()
  authorId!: number;

  @ApiProperty({
    example: [1, 2],
    description: 'List of category IDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @ApiProperty({
    example: '1778927129162453',
    description: 'Uploaded cover file ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 320, description: 'Number of pages', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  pages?: number;

  @ApiProperty({ example: 1999, description: 'Publish year', required: false })
  @IsOptional()
  @IsInt()
  publishYear?: number;
}
