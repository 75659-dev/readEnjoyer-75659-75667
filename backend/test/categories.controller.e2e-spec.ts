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
import { CategoriesController } from '../src/categories/categories.controller';
import { CategoriesService } from '../src/categories/categories.service';
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

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;

  const mockCategory = {
    id: 1,
    name: 'Horror',
  };

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
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

  describe('GET /categories', () => {
    it('should return all categories', () => {
      const categories = [mockCategory];

      mockCategoriesService.findAll.mockResolvedValue(categories);

      return request(app.getHttpServer())
        .get('/categories')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].name).toBe(mockCategory.name);
        });
    });

    it('should return empty array if no categories exist', () => {
      mockCategoriesService.findAll.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/categories')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe('GET /categories/:id', () => {
    it('should return category by ID', () => {
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      return request(app.getHttpServer())
        .get('/categories/1')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.id).toBe(mockCategory.id);
          expect(res.body.name).toBe(mockCategory.name);
        });
    });

    it('should return 404 if category not found', () => {
      mockCategoriesService.findOne.mockRejectedValue(
        new Error('Category not found'),
      );

      return request(app.getHttpServer())
        .get('/categories/999')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('POST /categories', () => {
    it('should create a new category', () => {
      const createCategoryDto = {
        name: 'Science Fiction',
      };

      mockCategoriesService.create.mockResolvedValue({
        id: 2,
        ...createCategoryDto,
      });

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', 'Bearer test-token')
        .send(createCategoryDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.name).toBe(createCategoryDto.name);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 if name is missing', () => {
      const createCategoryDto = {};

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', 'Bearer test-token')
        .send(createCategoryDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if name is too short', () => {
      const createCategoryDto = {
        name: 'AB',
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', 'Bearer test-token')
        .send(createCategoryDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if name is too long', () => {
      const createCategoryDto = {
        name: 'This is a very long category name that exceeds the maximum length',
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', 'Bearer test-token')
        .send(createCategoryDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if name is not a string', () => {
      const createCategoryDto = {
        name: 123,
      };

      return request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', 'Bearer test-token')
        .send(createCategoryDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update a category', () => {
      const updateCategoryDto = {
        name: 'Mystery',
      };

      mockCategoriesService.update.mockResolvedValue({
        id: 1,
        ...updateCategoryDto,
      });

      return request(app.getHttpServer())
        .patch('/categories/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateCategoryDto)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.name).toBe(updateCategoryDto.name);
        });
    });

    it('should return 404 if category to update not found', () => {
      const updateCategoryDto = {
        name: 'Updated Name',
      };

      mockCategoriesService.update.mockRejectedValue(
        new Error('Category not found'),
      );

      return request(app.getHttpServer())
        .patch('/categories/999')
        .set('Authorization', 'Bearer test-token')
        .send(updateCategoryDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 400 if name is too short', () => {
      const updateCategoryDto = {
        name: 'AB',
      };

      return request(app.getHttpServer())
        .patch('/categories/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateCategoryDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if name is too long', () => {
      const updateCategoryDto = {
        name: 'This is a very long category name that exceeds the maximum length',
      };

      return request(app.getHttpServer())
        .patch('/categories/1')
        .set('Authorization', 'Bearer test-token')
        .send(updateCategoryDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category', () => {
      mockCategoriesService.remove.mockResolvedValue({
        id: 1,
        name: 'Deleted Category',
      });

      return request(app.getHttpServer())
        .delete('/categories/1')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.OK);
    });

    it('should return 404 if category to delete not found', () => {
      mockCategoriesService.remove.mockRejectedValue(
        new Error('Category not found'),
      );

      return request(app.getHttpServer())
        .delete('/categories/999')
        .set('Authorization', 'Bearer test-token')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
