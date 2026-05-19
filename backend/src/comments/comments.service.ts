import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  // 1. Add a comment
  async create(userId: string, dto: CreateCommentDto) {
    // Check if the review exists
    const review = await this.prisma.review.findUnique({
      where: { id: dto.reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.comment.create({
      data: {
        text: dto.text,
        userId: userId,
        reviewId: dto.reviewId,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });
  }

  // 2. Get all comments for a review
  async findAllByReview(reviewId: string) {
    return this.prisma.comment.findMany({
      where: { reviewId },
      orderBy: { createdAt: 'asc' }, // Comments are typically read from oldest to newest
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    });
  }

  // 3. Delete own comment
  async remove(userId: string, commentId: string) {
    const [comment, user] = await Promise.all([
      this.prisma.comment.findUnique({
        where: { id: commentId },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    ]);

    if (!comment) throw new NotFoundException('Comment not found');
    if (!user) throw new NotFoundException('User not found');
    if (comment.userId !== userId && user.role !== 'ADMIN')
      throw new ForbiddenException('You can only delete your own comments');

    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
