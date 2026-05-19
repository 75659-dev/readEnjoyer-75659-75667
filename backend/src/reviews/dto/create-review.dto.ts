import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 1, description: 'Book ID to leave a review for' })
  @IsInt()
  bookId!: number;

  @ApiProperty({ example: 4, description: 'Rating from 1 to 5' })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Minimum rating is 1' })
  @Max(5, { message: 'Maximum rating is 5' })
  rating!: number;

  @ApiPropertyOptional({
    example: 'Great book, a real page-turner!',
    description: 'Review text',
  })
  @IsOptional()
  @IsString()
  text?: string;
}
