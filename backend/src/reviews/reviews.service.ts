import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, dto: CreateReviewDto) {
    const book = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${dto.bookId} not found`);
    }
    const exitingReview = await this.prisma.review.findFirst({
      where: {
        bookId: dto.bookId,
        userId,
      },
    });
    if (exitingReview) {
      throw new Error('You have already left a review for this book');
    }
    return this.prisma.review.create({
      data: {
        userId,
        bookId: dto.bookId,
        rating: dto.rating,
        text: dto.text,
      },
      include: { user: { select: { id: true, username: true, avatar: true } } }, // Include user's name and avatar in the response
    });
  }

  async findAllByBook(bookId: number) {
    return this.prisma.review.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, avatar: true } } }, // Include user's name and avatar in the response
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
  async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    // Protection: check that this review belongs to the user
    if (review.userId !== userId)
      throw new ForbiddenException('You can only edit your own reviews');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating,
        text: dto.text,
      },
    });
  }

  // 4. Remove own review
  async remove(userId: string, reviewId: string) {
    const [review, user] = await Promise.all([
      this.prisma.review.findUnique({
        where: { id: reviewId },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
    ]);

    if (!review) throw new NotFoundException('Review not found');
    if (!user) throw new NotFoundException('User not found');

    if (review.userId !== userId && user.role !== 'ADMIN')
      throw new ForbiddenException('You can only delete your own reviews');

    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}
