/// <reference types="jest" />

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  INestApplication,
  Module,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
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
  updateStatus: jest.fn(),
  remove: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
};

class FakeJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string };
    }>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    if (authHeader === 'Bearer admin-token') {
      request.user = { id: 'admin-user-id' };
      return true;
    }

    if (authHeader === 'Bearer user-token') {
      request.user = { id: 'regular-user-id' };
      return true;
    }

    if (authHeader === 'Bearer owner-token') {
      request.user = { id: 'owner-user-id' };
      return true;
    }

    throw new UnauthorizedException();
  }
}

@Module({
  controllers: [ItemsController],
  providers: [
    Reflector,
    RolesGuard,
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

      expect(mockItemsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'regular-user-id' }),
      );
    });
  });

  describe('GET /items/:id', () => {
    const itemId = '550e8400-e29b-41d4-a716-446655440000';

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get(`/items/${itemId}`).expect(401);

      expect(mockItemsService.findOne).not.toHaveBeenCalled();
    });

    it('returns 200 when a valid token is provided', async () => {
      const item = {
        id: itemId,
        title: 'Buy groceries',
        description: 'Need to buy milk, eggs, and bread',
        status: STATUS.PLANNED,
        priority: 3,
        listId: '550e8400-e29b-41d4-a716-446655440000',
        targetDate: '2026-03-10',
      };

      mockItemsService.findOne.mockResolvedValue(item);

      await request(app.getHttpServer())
        .get(`/items/${itemId}`)
        .set('Authorization', 'Bearer owner-token')
        .expect(200)
        .expect(item);

      expect(mockItemsService.findOne).toHaveBeenCalledWith(
        itemId,
        expect.objectContaining({ id: 'owner-user-id' }),
      );
    });
  });

  describe('PATCH /items/:id/status', () => {
    const itemId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const validPayload = { status: STATUS.IN_PROGRESS };

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .patch(`/items/${itemId}/status`)
        .send(validPayload)
        .expect(401);

      expect(mockItemsService.updateStatus).not.toHaveBeenCalled();
    });

    it('returns 400 for an invalid status value', async () => {
      await request(app.getHttpServer())
        .patch(`/items/${itemId}/status`)
        .set('Authorization', 'Bearer user-token')
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(mockItemsService.updateStatus).not.toHaveBeenCalled();
    });

    it('returns 404 when the item does not exist', async () => {
      mockItemsService.updateStatus.mockRejectedValue(
        new NotFoundException(`Item with id ${itemId} not found`),
      );

      await request(app.getHttpServer())
        .patch(`/items/${itemId}/status`)
        .set('Authorization', 'Bearer user-token')
        .send(validPayload)
        .expect(404);
    });

    it('returns 403 when the user is not the list owner and not an admin', async () => {
      mockItemsService.updateStatus.mockRejectedValue(
        new ForbiddenException(
          'You are not allowed to update this item status',
        ),
      );

      await request(app.getHttpServer())
        .patch(`/items/${itemId}/status`)
        .set('Authorization', 'Bearer user-token')
        .send(validPayload)
        .expect(403);
    });

    it('returns 200 when the user is an admin (not the list owner)', async () => {
      const updatedItem = { id: itemId, ...validPayload };
      mockItemsService.updateStatus.mockResolvedValue(updatedItem);

      await request(app.getHttpServer())
        .patch(`/items/${itemId}/status`)
        .set('Authorization', 'Bearer admin-token')
        .send(validPayload)
        .expect(200)
        .expect(updatedItem);

      expect(mockItemsService.updateStatus).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'admin-user-id' }),
        itemId,
        validPayload,
      );
    });

    it('returns 200 when the user is the list owner', async () => {
      const updatedItem = { id: itemId, ...validPayload };
      mockItemsService.updateStatus.mockResolvedValue(updatedItem);

      await request(app.getHttpServer())
        .patch(`/items/${itemId}/status`)
        .set('Authorization', 'Bearer owner-token')
        .send(validPayload)
        .expect(200)
        .expect(updatedItem);

      expect(mockItemsService.updateStatus).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'owner-user-id' }),
        itemId,
        validPayload,
      );
    });
  });
});
