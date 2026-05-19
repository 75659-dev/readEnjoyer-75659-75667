import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserLibraryDto } from './dto/update-user-library.dto';
import { ReadingStatus } from '@prisma/client';

@Injectable()
export class UserLibraryService {
  constructor(private prisma: PrismaService) {}

  // Get books (with optional status filtering)
  async getUserLibrary(userId: string, status?: ReadingStatus) {
    const whereClause: any = { userId };

    // If ?status=READING was provided, add it to the filter
    if (status) {
      whereClause.status = status;
    }

    return this.prisma.userLibrary.findMany({
      where: whereClause,
      include: {
        book: {
          include: { author: true, categories: true, reviews: true },
        },
      },
    });
  }

  // POST: Add a book to the shelf
  async addBookToLibrary(
    userId: string,
    bookId: number,
    dto: UpdateUserLibraryDto,
  ) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Book with ID ${bookId} not found`);

    const existingRecord = await this.prisma.userLibrary.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existingRecord) {
      throw new ConflictException(
        'This book is already on your shelf. Use PATCH to update.',
      );
    }

    return this.prisma.userLibrary.create({
      data: {
        userId,
        bookId,
        status: dto.status || 'WANT_TO_READ',
        pagesRead: dto.pagesRead || 0,
      },
    });
  }

  // PATCH: Update progress or status
  async updateLibraryBook(
    userId: string,
    bookId: number,
    dto: UpdateUserLibraryDto,
  ) {
    const existingRecord = await this.prisma.userLibrary.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (!existingRecord) {
      throw new NotFoundException('This book is not on your shelf');
    }

    return this.prisma.userLibrary.update({
      where: { userId_bookId: { userId, bookId } },
      data: {
        status: dto.status,
        pagesRead: dto.pagesRead,
      },
    });
  }

  // DELETE: Remove from shelf
  async removeFromLibrary(userId: string, bookId: number) {
    const existingRecord = await this.prisma.userLibrary.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (!existingRecord)
      throw new NotFoundException('This book is not on your shelf');

    return this.prisma.userLibrary.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  }
}
