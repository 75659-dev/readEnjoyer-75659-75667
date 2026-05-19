import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RtGuard } from '../src/auth/guards/rt.guard';
import { AtGuard } from '../src/auth/guards/at.guard';
import { GoogleAuthGuard } from '../src/auth/guards/google.guard';

class BypassGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.get('authorization');

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    req.user = { sub: 'test-user-123', refreshToken: 'test-refresh-token' };
    return true;
  }
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockAuthService = {
    register: jest.fn(),
    verifyEmail: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      update: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') return 'test';
      return null;
    }),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('token'),
    verifyAsync: jest.fn().mockResolvedValue({ sub: 'user' }),
  };

  const mockMailService = {
    sendVerifyLink: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'MailService', useValue: mockMailService },
      ],
    })
      .overrideGuard(RtGuard)
      .useClass(BypassGuard)
      .overrideGuard(AtGuard)
      .useClass(BypassGuard)
      .overrideGuard(GoogleAuthGuard)
      .useClass(BypassGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.register.mockResolvedValue({
        message:
          'Registration successful. Please check your email to verify your account.',
      });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toContain('Registration');
        });
    });

    it('should return 400 if user already exists', () => {
      const registerDto = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('User with this email already exists'),
      );

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if email format is invalid', () => {
      const registerDto = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if username is too short', () => {
      const registerDto = {
        username: 'abc',
        email: 'test@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /auth/verify-email', () => {
    it('should verify email with valid token', () => {
      const token = 'valid-token-123';

      mockAuthService.verifyEmail.mockResolvedValue({
        message: 'Email successfully verified. You can now log in.',
      });

      return request(app.getHttpServer())
        .get(`/auth/verify-email?token=${token}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toContain('verified');
        });
    });

    it('should return 200 with message if token is missing', () => {
      return request(app.getHttpServer())
        .get('/auth/verify-email')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.message).toContain('not provided');
        });
    });

    it('should return 404 if token is invalid', () => {
      const token = 'invalid-token';

      mockAuthService.verifyEmail.mockRejectedValue(
        new BadRequestException('Invalid or expired token'),
      );

      return request(app.getHttpServer())
        .get(`/auth/verify-email?token=${token}`)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with correct credentials', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue({
        accessToken: 'valid-access-token',
        refreshToken: 'valid-refresh-token',
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });

    it('should return 404 if user not found', () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(
        new BadRequestException('User not found'),
      );

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 if password is incorrect', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Invalid password'),
      );

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if email format is invalid', () => {
      const loginDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer valid-refresh-token')
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });

    it('should return 401 if refresh token is missing', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user and clear refresh token', () => {
      mockPrismaService.user.update.mockResolvedValue({});

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-access-token')
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.message).toContain('Logged out');
        });
    });

    it('should return 401 if access token is missing', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /auth/google', () => {
    it('should redirect to Google OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .set('Authorization', 'Bearer dummy-token')
        .expect(HttpStatus.OK);
    });
  });
});
