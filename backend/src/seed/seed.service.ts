import { Injectable } from '@nestjs/common';
import { ReadingStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  async seedFakeData() {
    const password = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
      this.prisma.user.upsert({
        where: { email: 'alice.reader@example.com' },
        update: {},
        create: {
          username: 'alice_reader',
          email: 'alice.reader@example.com',
          password,
          role: Role.USER,
          isEmailVerified: true,
          avatar: 'https://i.pravatar.cc/160?img=1',
        },
      }),
      this.prisma.user.upsert({
        where: { email: 'mark.pages@example.com' },
        update: {},
        create: {
          username: 'mark_pages',
          email: 'mark.pages@example.com',
          password,
          role: Role.USER,
          isEmailVerified: true,
          avatar: 'https://i.pravatar.cc/160?img=3',
        },
      }),
      this.prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { role: Role.ADMIN, isEmailVerified: true },
        create: {
          username: 'admin_user',
          email: 'admin@example.com',
          password,
          role: Role.ADMIN,
          isEmailVerified: true,
          avatar: 'https://i.pravatar.cc/160?img=5',
        },
      }),
    ]);

    const authors = await Promise.all(
      [
        {
          name: 'Frank Herbert',
          bio: 'American science fiction author best known for Dune.',
          image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f',
        },
        {
          name: 'Jane Austen',
          bio: 'English novelist known for social observation and wit.',
          image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d',
        },
        {
          name: 'George Orwell',
          bio: 'English novelist, essayist, and critic.',
          image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc',
        },
        {
          name: 'Ursula K. Le Guin',
          bio: 'Influential author of speculative fiction.',
          image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
        },
      ].map((author) =>
        this.prisma.author.upsert({
          where: { name: author.name },
          update: {},
          create: author,
        }),
      ),
    );

    const categories = await Promise.all(
      ['Sci-Fi', 'Classics', 'Romance', 'Dystopian', 'Fantasy'].map((name) =>
        this.prisma.category.upsert({
          where: { name },
          update: {},
          create: { name },
        }),
      ),
    );

    const categoryByName = new Map(
      categories.map((category) => [category.name, category]),
    );
    const authorByName = new Map(
      authors.map((author) => [author.name, author]),
    );

    const books = await Promise.all(
      [
        {
          title: 'Dune',
          description:
            'A desert planet, a powerful family, and the politics of spice.',
          price: 19.99,
          stock: 35,
          pages: 688,
          publishYear: 1965,
          image: '1778927129162453',
          authorName: 'Frank Herbert',
          categoryNames: ['Sci-Fi', 'Fantasy'],
        },
        {
          title: 'Pride and Prejudice',
          description:
            'A sharp comedy of manners about love, class, and first impressions.',
          price: 12.5,
          stock: 48,
          pages: 432,
          publishYear: 1813,
          image: '1778927129162454',
          authorName: 'Jane Austen',
          categoryNames: ['Classics', 'Romance'],
        },
        {
          title: '1984',
          description:
            'A dystopian novel about surveillance, language, and power.',
          price: 14.99,
          stock: 52,
          pages: 328,
          publishYear: 1949,
          image: '1778927129162455',
          authorName: 'George Orwell',
          categoryNames: ['Classics', 'Dystopian'],
        },
        {
          title: 'A Wizard of Earthsea',
          description:
            'A coming-of-age fantasy about names, shadows, and responsibility.',
          price: 16.25,
          stock: 27,
          pages: 240,
          publishYear: 1968,
          image: '1778927129162456',
          authorName: 'Ursula K. Le Guin',
          categoryNames: ['Fantasy', 'Sci-Fi'],
        },
      ].map(async (book) => {
        const author = authorByName.get(book.authorName);
        if (!author) {
          throw new Error(`Seed author not found: ${book.authorName}`);
        }

        const existingBook = await this.prisma.book.findFirst({
          where: { title: book.title, authorId: author.id },
        });

        const categoryIds = book.categoryNames
          .map((name) => categoryByName.get(name)?.id)
          .filter((id): id is number => Boolean(id));

        const sharedData = {
          title: book.title,
          description: book.description,
          price: book.price,
          stock: book.stock,
          pages: book.pages,
          publishYear: book.publishYear,
          image: book.image,
        };

        if (existingBook) {
          return this.prisma.book.update({
            where: { id: existingBook.id },
            data: {
              ...sharedData,
              authorId: author.id,
              categories: {
                set: categoryIds.map((id) => ({ id })),
              },
            },
          });
        }

        return this.prisma.book.create({
          data: {
            ...sharedData,
            author: {
              connect: { id: author.id },
            },
            categories: {
              connect: categoryIds.map((id) => ({ id })),
            },
          },
        });
      }),
    );

    await Promise.all([
      this.prisma.userLibrary.upsert({
        where: {
          userId_bookId: {
            userId: users[0].id,
            bookId: books[0].id,
          },
        },
        update: { status: ReadingStatus.READING, pagesRead: 180 },
        create: {
          userId: users[0].id,
          bookId: books[0].id,
          status: ReadingStatus.READING,
          pagesRead: 180,
        },
      }),
      this.prisma.userLibrary.upsert({
        where: {
          userId_bookId: {
            userId: users[0].id,
            bookId: books[1].id,
          },
        },
        update: { status: ReadingStatus.WANT_TO_READ, pagesRead: 0 },
        create: {
          userId: users[0].id,
          bookId: books[1].id,
          status: ReadingStatus.WANT_TO_READ,
          pagesRead: 0,
        },
      }),
      this.prisma.userLibrary.upsert({
        where: {
          userId_bookId: {
            userId: users[1].id,
            bookId: books[2].id,
          },
        },
        update: { status: ReadingStatus.READ, pagesRead: 328 },
        create: {
          userId: users[1].id,
          bookId: books[2].id,
          status: ReadingStatus.READ,
          pagesRead: 328,
        },
      }),
    ]);

    const reviews = await Promise.all([
      this.prisma.review.upsert({
        where: {
          userId_bookId: {
            userId: users[0].id,
            bookId: books[0].id,
          },
        },
        update: {
          rating: 5,
          text: 'Huge, strange, political, and completely addictive.',
        },
        create: {
          userId: users[0].id,
          bookId: books[0].id,
          rating: 5,
          text: 'Huge, strange, political, and completely addictive.',
        },
      }),
      this.prisma.review.upsert({
        where: {
          userId_bookId: {
            userId: users[1].id,
            bookId: books[0].id,
          },
        },
        update: {
          rating: 4,
          text: 'Dense in the best way. The worldbuilding carries everything.',
        },
        create: {
          userId: users[1].id,
          bookId: books[0].id,
          rating: 4,
          text: 'Dense in the best way. The worldbuilding carries everything.',
        },
      }),
      this.prisma.review.upsert({
        where: {
          userId_bookId: {
            userId: users[1].id,
            bookId: books[2].id,
          },
        },
        update: {
          rating: 5,
          text: 'Still terrifyingly relevant.',
        },
        create: {
          userId: users[1].id,
          bookId: books[2].id,
          rating: 5,
          text: 'Still terrifyingly relevant.',
        },
      }),
    ]);

    await this.createCommentIfMissing(
      reviews[0].id,
      users[1].id,
      'That is exactly how I felt after finishing it.',
    );
    await this.createCommentIfMissing(
      reviews[2].id,
      users[0].id,
      'The final chapters hit especially hard.',
    );

    const existingOrder = await this.prisma.order.findFirst({
      where: { userId: users[0].id, status: 'PAID' },
      include: { items: true },
    });

    const order =
      existingOrder ??
      (await this.prisma.order.create({
        data: {
          userId: users[0].id,
          total: 32.49,
          status: 'PAID',
          items: {
            create: [
              { bookId: books[0].id, quantity: 1, price: books[0].price },
              { bookId: books[1].id, quantity: 1, price: books[1].price },
            ],
          },
        },
        include: { items: true },
      }));

    return {
      message: 'Fake data seeded successfully.',
      endpoint: 'POST /seed/fake-data',
      credentials: {
        user: 'alice.reader@example.com',
        admin: 'admin@example.com',
        password: 'password123',
      },
      counts: {
        users: users.length,
        authors: authors.length,
        categories: categories.length,
        books: books.length,
        reviews: reviews.length,
        orderItems: order.items.length,
      },
    };
  }

  private async createCommentIfMissing(
    reviewId: string,
    userId: string,
    text: string,
  ) {
    const existingComment = await this.prisma.comment.findFirst({
      where: { reviewId, userId, text },
    });

    if (existingComment) {
      return existingComment;
    }

    return this.prisma.comment.create({
      data: { reviewId, userId, text },
    });
  }
}
