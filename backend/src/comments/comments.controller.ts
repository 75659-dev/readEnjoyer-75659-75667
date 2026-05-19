import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

@ApiTags('Comments (Review comments)')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('review/:reviewId')
  @ApiOperation({ summary: 'Get all comments for a specific review' })
  findAllByReview(@Param('reviewId') reviewId: string) {
    return this.commentsService.findAllByReview(reviewId);
  }

  @UseGuards(AtGuard)
  @Post()
  @ApiOperation({ summary: 'Leave a comment under a review' })
  create(
    @GetCurrentUser('sub') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(userId, createCommentDto);
  }

  @UseGuards(AtGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete your comment' })
  remove(@GetCurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.commentsService.remove(userId, id);
  }
}
