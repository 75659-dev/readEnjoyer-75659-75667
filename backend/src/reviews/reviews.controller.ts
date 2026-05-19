import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

@ApiTags('Reviews (Reviews and Ratings)')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get all my reviews' })
  findMyReviews(@GetCurrentUser('sub') userId: string) {
    return this.reviewsService.findAllByUser(userId);
  }

  // 🟢 PUBLIC: Everyone can read reviews
  @Get('book/:bookId')
  @ApiOperation({ summary: 'Get all reviews for a specific book' })
  findAllByBook(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.reviewsService.findAllByBook(bookId);
  }

  // 🟡 PROTECTED: Create, edit and delete — only authenticated users
  @UseGuards(AtGuard)
  @ApiBearerAuth() // For Swagger (if you use Bearer tokens visually)
  @Post()
  @ApiOperation({ summary: 'Leave a review for a book' })
  create(
    @GetCurrentUser('sub') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @UseGuards(AtGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Edit your review' })
  update(
    @GetCurrentUser('sub') userId: string,
    @Param('id') id: string, // Note: review ID is a string (UUID), so no ParseIntPipe
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(userId, id, updateReviewDto);
  }

  @UseGuards(AtGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete your review' })
  remove(@GetCurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.reviewsService.remove(userId, id);
  }
}
