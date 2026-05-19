import { PrismaClient, Role, ReadingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding... 🌱');

  // --- 1. Create categories ---
  const fantasyCategory = await prisma.category.upsert({
    where: { name: 'Fantasy' },
    update: {},
    create: { name: 'Fantasy' },
  });

  const sciFiCategory = await prisma.category.upsert({
    where: { name: 'Science Fiction' },
    update: {},
    create: { name: 'Science Fiction' },
  });

  // --- 2. Create authors ---
  const authorTolkien = await prisma.author.upsert({
    where: { name: 'J.R.R. Tolkien' },
    update: {},
    create: {
      name: 'J.R.R. Tolkien',
      bio: 'English writer, poet, philologist, and academic.',
    },
  });

  const authorHerbert = await prisma.author.upsert({
    where: { name: 'Frank Herbert' },
    update: {},
    create: {
      name: 'Frank Herbert',
      bio: 'American science fiction author.',
    },
  });

  // --- 3. Create users ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'adminUser',
      password: 'hashed_password_here', // In a real project use bcrypt
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'bookWorm99',
      password: 'hashed_password_here',
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  // --- 4. Create books ---
  // First, we avoid duplicating books when seeding by checking count
  // Alternatively, check by title if you prefer. For simplicity we create books if none exist.

  // Check if books already exist in the database to avoid duplicates
  const booksCount = await prisma.book.count();

  let book1Id, book2Id;

  if (booksCount === 0) {
    const book1 = await prisma.book.create({
      data: {
        title: 'The Hobbit',
        description: 'A fantasy novel by J. R. R. Tolkien.',
        price: 15.99,
        stock: 50,
        pages: 310,
        publishYear: 1937,
        authorId: authorTolkien.id,
        categories: {
          connect: [{ id: fantasyCategory.id }],
        },
      },
    });
    book1Id = book1.id;

    const book2 = await prisma.book.create({
      data: {
        title: 'Dune',
        description: 'A science fiction novel by Frank Herbert.',
        price: 19.99,
        stock: 30,
        pages: 412,
        publishYear: 1965,
        authorId: authorHerbert.id,
        categories: {
          connect: [{ id: sciFiCategory.id }],
        },
      },
    });
    book2Id = book2.id;
    console.log('Books added successfully.');
  } else {
    console.log('Books already exist in the database, skipping creation.');
    const existingBooks = await prisma.book.findMany({ take: 2 });
    book1Id = existingBooks[0].id;
    book2Id = existingBooks[1].id;
  }
  // --- 5. User library, reviews and comments ---
  // Add a book to the user's library (ensuring uniqueness by [userId, bookId])
  if (book1Id) {
    await prisma.userLibrary.upsert({
      where: {
        userId_bookId: {
          userId: normalUser.id,
          bookId: book1Id,
        },
      },
      update: {},
      create: {
        userId: normalUser.id,
        bookId: book1Id,
        status: ReadingStatus.READING,
        pagesRead: 45,
      },
    });

    // Add a review (ensuring uniqueness by [userId, bookId])
    const review = await prisma.review.upsert({
      where: {
        userId_bookId: {
          userId: normalUser.id,
          bookId: book1Id,
        },
      },
      update: {},
      create: {
        userId: normalUser.id,
        bookId: book1Id,
        rating: 5,
        text: 'This book is an absolute masterpiece!',
      },
    });

    // Create a comment on the review from the admin (since comments don't have composite unique keys)
    const existingComment = await prisma.comment.findFirst({
      where: { reviewId: review.id },
    });

    if (!existingComment) {
      await prisma.comment.create({
        data: {
          text: 'I totally agree with your review!',
          userId: admin.id,
          reviewId: review.id,
        },
      });
    }
  }

  // --- 6. Orders ---
  const existingOrder = await prisma.order.findFirst({
    where: { userId: normalUser.id },
  });

  if (!existingOrder && book2Id) {
    await prisma.order.create({
      data: {
        userId: normalUser.id,
        total: 19.99,
        status: 'COMPLETED',
        items: {
          create: [
            {
              bookId: book2Id,
              quantity: 1,
              price: 19.99,
            },
          ],
        },
      },
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
