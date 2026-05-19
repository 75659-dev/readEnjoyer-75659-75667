import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchBooks(query: string) {
    // If the query is empty (user just pressed Enter), return nothing
    if (!query || query.trim() === '') {
      return [];
    }

    // Search for books where the query matches the book title OR the author's name
    return this.prisma.book.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            author: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      include: {
        author: true,
        categories: true, // Include categories (genres)
      },
      take: 20, // Limit results to avoid returning too many items
    });
  }
}
