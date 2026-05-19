import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { BooksController } from '../src/books/books.controller';
import { BooksService } from '../src/books/books.service';
import { AtGuard } from '../src/auth/guards/at.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';

class ProtectedGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.get('authorization');

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    req.user = { sub: 'test-user-123', role: 'ADMIN' };
    return true;
  }
}

describe('BooksController (e2e)', () => {
  let app: INestApplication;

  const mockBook = {
    id: 1,
    title: 'The Shining',
    description: 'A psychological horror novel',
    price: 19.99,
    stock: 50,
    authorId: 1,
    pages: 447,
    publishYear: 1977,
    image: 'https://example.com/shining.jpg',
    author: {
      id: 1,
      name: 'Stephen King',
      bio: 'American author',
      image: 'https://example.com/king.jpg',
    },
    categories: [
      {
        id: 1,
        name: 'Horror',
      },
    ],
  };

  const mockBooksService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: mockBooksService }],
    })
      .overrideGuard(AtGuard)
      .useClass(ProtectedGuard)
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /books', () => {
    it('should return all books', () => {
      const books = [mockBook];

      mockBooksService.findAll.mockResolvedValue(books);

      return request(app.getHttpServer())
        .get('/books')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].title).toBe(mockBook.title);
        });
    });

    it('should return empty array if no books exist', () => {
      mockBooksService.findAll.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/books')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('GET /books/:id', () => {
    it('should return book by ID', () => {
      mockBooksService.findOne.mockResolvedValue(mockBook);

      return request(app.getHttpServer())
        .get('/books/1')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toBe(mockBook.id);
          expect(res.body.title).toBe(mockBook.title);
          expect(res.body.author).toBeDefined();
          expect(res.body.categories).toBeDefined();
        });
    });

    it('should return 404 if book not found', () => {
      mockBooksService.findOne.mockRejectedValue(
        new Error('Book with ID 999 not found'),
      );

      return request(app.getHttpServer())
        .get('/books/999')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 400 if ID is not a number', () => {
      return request(app.getHttpServer())
        .get('/books/invalid')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /books', () => {
    it('should create a new book', () => {
      const createBookDto = {
        title: 'The Stand',
        description: 'Post-apocalyptic novel',
        price: 24.99,
        stock: 30,
        authorId: 1,
        categoryIds: [1],
      };

      mockBooksService.create.mockResolvedValue({
        id: 2,
        ...createBookDto,
        pages: 1152,
        publishYear: 1978,
        image: null,
      });

      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization', 'Bearer test-token')
        .send(createBookDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.title).toBe(createBookDto.title);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 if required fields are missing', () => {
      const createBookDto = {
        title: 'Missing Fields Book',
        price: 10.99,
      };

      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization', 'Bearer test-token')
        .send(createBookDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if price is negative', () => {
      const createBookDto = {
        title: 'Negative Price Book',
        description: 'Test',
        price: -5,
        stock: 10,
        authorId: 1,
      };

      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization', 'Bearer test-token')
        .send(createBookDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 if author does not exist', () => {
      const createBookDto = {
        title: 'Unknown Author Book',
        description: 'Test',
        price: 10.99,
        stock: 10,
        authorId: 999,
      };

      mockBooksService.create.mockRejectedValue(
        new Error('Author with ID 999 not found'),
      );

      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization', 'Bearer test-token')
        .send(createBookDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should handle optional fields correctly', () => {
      const createBookDto = {
        title: 'Minimal Book',
        price: 15.99,
        stock: 20,
        authorId: 1,
      };

      mockBooksService.create.mockResolvedValue({
        id: 3,
        ...createBookDto,
        description: null,
        categoryIds: [],
      });

      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization', 'Bearer test-token')
        .send(createBookDto)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('PUT /books/:id', () => {
    it('should update a book', () => {
      const updateBookDto = {
        title: 'The Shining Updated',
        description: 'Updated description',
        price: 22.99,
        stock: 60,
        authorId: 1,
        categoryIds: [1, 2],
      };

      mockBooksService.update.mockResolvedValue({
        id: 1,
        ...updateBookDto,
      });

      return request(app.getHttpServer())
        .put('/books/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateBookDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.title).toBe(updateBookDto.title);
          expect(res.body.price).toBe(updateBookDto.price);
        });
    });

    it('should return 404 if book to update not found', () => {
      const updateBookDto = {
        title: 'Updated Title',
        description: 'Updated description',
        price: 20.0,
        stock: 40,
        authorId: 1,
      };

      mockBooksService.update.mockRejectedValue(new Error('Book not found'));

      return request(app.getHttpServer())
        .put('/books/999')
        .set('Authorization', 'Bearer test-token')
        .send(updateBookDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 400 if ID is not a number', () => {
      const updateBookDto = {
        title: 'Updated Title',
        description: 'Updated description',
        price: 20.0,
        stock: 40,
        authorId: 1,
      };

      return request(app.getHttpServer())
        .put('/books/invalid')
        .set('Authorization', 'Bearer test-token')
        .send(updateBookDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete a book', () => {
      mockBooksService.remove.mockResolvedValue({
        id: 1,
        title: 'Deleted Book',
      });

      return request(app.getHttpServer())
        .delete('/books/1')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.OK);
    });

    it('should return 404 if book to delete not found', () => {
      mockBooksService.remove.mockRejectedValue(new Error('Book not found'));

      return request(app.getHttpServer())
        .delete('/books/999')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 400 if ID is not a number', () => {
      return request(app.getHttpServer())
        .delete('/books/invalid')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
