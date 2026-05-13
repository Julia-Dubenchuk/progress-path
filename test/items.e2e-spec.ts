/// <reference types="jest" />

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
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { STATUS } from '../src/common/enums/status.enum';
import { ItemsController } from '../src/items/items.controller';
import { ItemsService } from '../src/items/items.service';
import { RoleName } from '../src/roles/entities/role.entity';
import { User } from '../src/users/entities/user.entity';

const mockItemsService = {
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
  controllers: [ItemsController],
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
      provide: ItemsService,
      useValue: mockItemsService,
    },
    {
      provide: getRepositoryToken(User),
      useValue: mockUserRepository,
    },
  ],
})
class ItemsE2eTestModule {}

describe('ItemsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ItemsE2eTestModule],
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

  describe('POST /items', () => {
    const payload = {
      title: 'Buy groceries',
      description: 'Need to buy milk, eggs, and bread',
      status: STATUS.PLANNED,
      priority: 3,
      listId: '550e8400-e29b-41d4-a716-446655440000',
      targetDate: '2026-03-10',
    };

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/items')
        .send(payload)
        .expect(401);

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockItemsService.create).not.toHaveBeenCalled();
    });

    it('returns 403 when the token is valid but the user has the wrong role', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'regular-user-id',
        roles: [{ name: RoleName.USER }],
      });

      await request(app.getHttpServer())
        .post('/items')
        .set('Authorization', 'Bearer user-token')
        .send(payload)
        .expect(403);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'regular-user-id' },
        relations: ['roles'],
      });
      expect(mockItemsService.create).not.toHaveBeenCalled();
    });

    it('returns 201 when the token is valid and the user has the correct role', async () => {
      const createdItem = {
        id: 'item-id',
        ...payload,
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: 'admin-user-id',
        roles: [{ name: RoleName.ADMIN }],
      });
      mockItemsService.create.mockResolvedValue(createdItem);

      await request(app.getHttpServer())
        .post('/items')
        .set('Authorization', 'Bearer admin-token')
        .send(payload)
        .expect(201)
        .expect(createdItem);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'admin-user-id' },
        relations: ['roles'],
      });
      expect(mockItemsService.create).toHaveBeenCalledWith(payload);
    });
  });

  describe('GET /items', () => {
    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/items').expect(401);

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockItemsService.findAll).not.toHaveBeenCalled();
    });

    it('returns 200 when a valid token is provided', async () => {
      const items = [
        {
          id: 'item-1',
          title: 'Buy groceries',
          description: 'Need to buy milk, eggs, and bread',
          status: STATUS.PLANNED,
          priority: 3,
          listId: '550e8400-e29b-41d4-a716-446655440000',
          targetDate: '2026-03-10',
        },
      ];

      mockItemsService.findAll.mockResolvedValue(items);

      await request(app.getHttpServer())
        .get('/items')
        .set('Authorization', 'Bearer user-token')
        .expect(200)
        .expect(items);

      expect(mockItemsService.findAll).toHaveBeenCalled();
    });
  });
});
