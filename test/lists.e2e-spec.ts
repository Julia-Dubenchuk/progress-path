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
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { STATUS } from '../src/common/enums/status.enum';
import { ListsController } from '../src/lists/lists.controller';
import { ListsService } from '../src/lists/lists.service';
import { RoleName } from '../src/roles/entities/role.entity';
import { User } from '../src/users/entities/user.entity';

const mockListsService = {
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
  controllers: [ListsController],
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
      provide: ListsService,
      useValue: mockListsService,
    },
    {
      provide: getRepositoryToken(User),
      useValue: mockUserRepository,
    },
  ],
})
class ListsE2eTestModule {}

describe('ListsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ListsE2eTestModule],
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

  describe('POST /lists', () => {
    const payload = {
      title: 'Weekly goals',
      description: 'Track the top priorities for this week.',
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      targetDate: '2026-03-01',
      status: STATUS.PLANNED,
    };

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/lists')
        .send(payload)
        .expect(401);

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockListsService.create).not.toHaveBeenCalled();
    });

    it('returns 403 when the token is valid but the user has the wrong role', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'regular-user-id',
        roles: [{ name: RoleName.USER }],
      });

      await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', 'Bearer user-token')
        .send(payload)
        .expect(403);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'regular-user-id' },
        relations: ['roles'],
      });
      expect(mockListsService.create).not.toHaveBeenCalled();
    });

    it('returns 201 when the token is valid and the user has the correct role', async () => {
      const createdList = {
        id: 'list-id',
        ...payload,
        userId: 'admin-user-id',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: 'admin-user-id',
        roles: [{ name: RoleName.ADMIN }],
      });
      mockListsService.create.mockResolvedValue(createdList);

      await request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', 'Bearer admin-token')
        .send(payload)
        .expect(201)
        .expect(createdList);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'admin-user-id' },
        relations: ['roles'],
      });
      expect(mockListsService.create).toHaveBeenCalledWith(
        payload,
        'admin-user-id',
      );
    });
  });

  describe('GET /lists', () => {
    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/lists').expect(401);

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockListsService.findAll).not.toHaveBeenCalled();
    });

    it('returns 200 when a valid token is provided', async () => {
      const lists = [
        {
          id: 'list-1',
          title: 'Weekly goals',
          description: 'Track the top priorities for this week.',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          userId: 'admin-user-id',
          targetDate: '2026-03-01',
          status: STATUS.PLANNED,
        },
      ];

      mockListsService.findAll.mockResolvedValue(lists);

      await request(app.getHttpServer())
        .get('/lists')
        .set('Authorization', 'Bearer user-token')
        .expect(200)
        .expect(lists);

      expect(mockListsService.findAll).toHaveBeenCalled();
    });
  });
});
