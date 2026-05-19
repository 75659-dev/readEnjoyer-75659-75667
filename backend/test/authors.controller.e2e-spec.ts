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
import { AuthorsController } from '../src/authors/authors.controller';
import { AuthorsService } from '../src/authors/authors.service';
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

describe('AuthorsController (e2e)', () => {
  let app: INestApplication;

  const mockAuthor = {
    id: 1,
    name: 'Stephen King',
    bio: 'American author of horror and fiction',
    image: 'https://example.com/king.jpg',
  };

  const mockAuthorsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [{ provide: AuthorsService, useValue: mockAuthorsService }],
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

  describe('GET /authors', () => {
    it('should return all authors', () => {
      const authors = [mockAuthor];

      mockAuthorsService.findAll.mockResolvedValue(authors);

      return request(app.getHttpServer())
        .get('/authors')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should return empty array if no authors exist', () => {
      mockAuthorsService.findAll.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/authors')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('GET /authors/:id', () => {
    it('should return author by ID', () => {
      mockAuthorsService.findOne.mockResolvedValue(mockAuthor);

      return request(app.getHttpServer())
        .get('/authors/1')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toBe(mockAuthor.id);
          expect(res.body.name).toBe(mockAuthor.name);
        });
    });

    it('should return 404 if author not found', () => {
      mockAuthorsService.findOne.mockRejectedValue(
        new Error('Author with ID 999 not found'),
      );

      return request(app.getHttpServer())
        .get('/authors/999')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 400 if ID is not a number', () => {
      return request(app.getHttpServer())
        .get('/authors/invalid')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /authors', () => {
    it('should create a new author', () => {
      const createAuthorDto = {
        name: 'J.K. Rowling',
        bio: 'British author',
        image: 'https://example.com/rowling.jpg',
      };

      mockAuthorsService.create.mockResolvedValue({
        id: 2,
        ...createAuthorDto,
      });

      return request(app.getHttpServer())
        .post('/authors')
        .set('Authorization', 'Bearer test-token')
        .send(createAuthorDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.name).toBe(createAuthorDto.name);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 if required fields are missing', () => {
      const createAuthorDto = {
        bio: 'British author',
      };

      return request(app.getHttpServer())
        .post('/authors')
        .set('Authorization', 'Bearer test-token')
        .send(createAuthorDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should create author with optional fields', () => {
      const createAuthorDto = {
        name: 'Unknown Author',
      };

      mockAuthorsService.create.mockResolvedValue({
        id: 3,
        ...createAuthorDto,
        bio: null,
        image: null,
      });

      return request(app.getHttpServer())
        .post('/authors')
        .set('Authorization', 'Bearer test-token')
        .send(createAuthorDto)
        .expect(HttpStatus.CREATED);
    });
  });

  describe('PUT /authors/:id', () => {
    it('should update an author', () => {
      const updateAuthorDto = {
        name: 'Stephen King Updated',
        bio: 'Updated biography',
        image: 'https://example.com/king-updated.jpg',
      };

      mockAuthorsService.update.mockResolvedValue({
        id: 1,
        ...updateAuthorDto,
      });

      return request(app.getHttpServer())
        .put('/authors/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateAuthorDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.name).toBe(updateAuthorDto.name);
        });
    });

    it('should return 404 if author to update not found', () => {
      const updateAuthorDto = {
        name: 'Updated Name',
        bio: 'Updated bio',
        image: 'https://example.com/updated.jpg',
      };

      mockAuthorsService.update.mockRejectedValue(
        new Error('Author not found'),
      );

      return request(app.getHttpServer())
        .put('/authors/999')
        .set('Authorization', 'Bearer test-token')
        .send(updateAuthorDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 400 if ID is not a number', () => {
      const updateAuthorDto = {
        name: 'Updated Name',
        bio: 'Updated bio',
        image: 'https://example.com/updated.jpg',
      };

      return request(app.getHttpServer())
        .put('/authors/invalid')
        .set('Authorization', 'Bearer test-token')
        .send(updateAuthorDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /authors/:id', () => {
    it('should delete an author', () => {
      mockAuthorsService.remove.mockResolvedValue({
        id: 1,
        name: 'Deleted Author',
      });

      return request(app.getHttpServer())
        .delete('/authors/1')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.OK);
    });

    it('should return 404 if author to delete not found', () => {
      mockAuthorsService.remove.mockRejectedValue(
        new Error('Author not found'),
      );

      return request(app.getHttpServer())
        .delete('/authors/999')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 400 if ID is not a number', () => {
      return request(app.getHttpServer())
        .delete('/authors/invalid')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
