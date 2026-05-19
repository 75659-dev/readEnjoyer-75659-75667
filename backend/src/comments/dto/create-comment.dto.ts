import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'I fully agree with the reviewer!',
    description: 'Comment text',
  })
  @IsString()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  text!: string;

  @ApiProperty({
    example: 'uuid-string-of-review',
    description: 'Review ID to which the comment belongs',
  })
  @IsUUID(4, { message: 'Invalid review ID format' })
  reviewId!: string;
}
