import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  Module,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { CategoriesController } from '../src/categories/categories.controller';
import { CategoriesService } from '../src/categories/categories.service';
import { CategoryTitle } from '../src/categories/entities/category.entity';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { RoleName } from '../src/roles/entities/role.entity';
import { User } from '../src/users/entities/user.entity';

const mockCategoriesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

class FakeJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string; sub: string };
    }>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    if (authHeader === 'Bearer admin-token') {
      request.user = { id: 'admin-user-id', sub: 'admin-user-id' };
      return true;
    }

    if (authHeader === 'Bearer user-token') {
      request.user = { id: 'regular-user-id', sub: 'regular-user-id' };
      return true;
    }

    throw new UnauthorizedException();
  }
}

@Module({
  controllers: [CategoriesController],
  providers: [
    Reflector,
    FakeJwtAuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useExisting: FakeJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
    {
      provide: CategoriesService,
      useValue: mockCategoriesService,
    },
    {
      provide: getRepositoryToken(User),
      useValue: mockUserRepository,
    },
  ],
})
class CategoriesE2eTestModule {}

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CategoriesE2eTestModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(FakeJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /categories', () => {
    const payload = {
      title: CategoryTitle.BOOKS,
      description: 'Books and reading lists',
    };

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send(payload)
        .expect(401);

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockCategoriesService.create).not.toHaveBeenCalled();
    });

    it('returns 403 when the token is valid but the user has the wrong role', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'regular-user-id',
        roles: [{ name: RoleName.USER }],
      });

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', 'Bearer user-token')
        .send(payload)
        .expect(403);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'regular-user-id' },
        relations: ['roles'],
      });
      expect(mockCategoriesService.create).not.toHaveBeenCalled();
    });

    it('returns 201 when the token is valid and the user has the correct role', async () => {
      const createdCategory = {
        id: 'category-id',
        ...payload,
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: 'admin-user-id',
        roles: [{ name: RoleName.ADMIN }],
      });
      mockCategoriesService.create.mockResolvedValue(createdCategory);

      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', 'Bearer admin-token')
        .send(payload)
        .expect(201)
        .expect(createdCategory);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'admin-user-id' },
        relations: ['roles'],
      });
      expect(mockCategoriesService.create).toHaveBeenCalledWith(payload);
    });
  });

  describe('GET /categories', () => {
    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/categories').expect(401);

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockCategoriesService.findAll).not.toHaveBeenCalled();
    });

    it('returns 200 when a valid token is provided', async () => {
      const categories = [
        {
          id: 'category-1',
          title: CategoryTitle.BOOKS,
          description: 'Books and reading lists',
        },
        {
          id: 'category-2',
          title: CategoryTitle.MOVIES,
          description: 'Movies to watch',
        },
      ];

      mockCategoriesService.findAll.mockResolvedValue(categories);

      await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', 'Bearer user-token')
        .expect(200)
        .expect(categories);

      expect(mockCategoriesService.findAll).toHaveBeenCalled();
    });
  });
});
