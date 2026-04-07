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
import { MoodsController } from '../src/moods/moods.controller';
import { MoodsService } from '../src/moods/moods.service';
import { RoleName } from '../src/roles/entities/role.entity';
import { User } from '../src/users/entities/user.entity';

const mockMoodsService = {
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
  controllers: [MoodsController],
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
      provide: MoodsService,
      useValue: mockMoodsService,
    },
    {
      provide: getRepositoryToken(User),
      useValue: mockUserRepository,
    },
  ],
})
class MoodsE2eTestModule {}

describe('MoodsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MoodsE2eTestModule],
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

  describe('POST /moods', () => {
    const payload = {
      mood: 'happy',
      note: 'Had a productive day and felt energized.',
      date: '2026-02-18',
    };

    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/moods')
        .send(payload)
        .expect(401);

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockMoodsService.create).not.toHaveBeenCalled();
    });

    it('returns 403 when the token is valid but the user has the wrong role', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'regular-user-id',
        roles: [{ name: RoleName.USER }],
      });

      await request(app.getHttpServer())
        .post('/moods')
        .set('Authorization', 'Bearer user-token')
        .send(payload)
        .expect(403);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'regular-user-id' },
        relations: ['roles'],
      });
      expect(mockMoodsService.create).not.toHaveBeenCalled();
    });

    it('returns 201 when the token is valid and the user has the correct role', async () => {
      const createdMood = {
        id: 'mood-id',
        ...payload,
        userId: 'admin-user-id',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: 'admin-user-id',
        roles: [{ name: RoleName.ADMIN }],
      });
      mockMoodsService.create.mockResolvedValue(createdMood);

      await request(app.getHttpServer())
        .post('/moods')
        .set('Authorization', 'Bearer admin-token')
        .send(payload)
        .expect(201)
        .expect(createdMood);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'admin-user-id' },
        relations: ['roles'],
      });
      expect(mockMoodsService.create).toHaveBeenCalledWith(
        payload,
        'admin-user-id',
      );
    });
  });

  describe('GET /moods', () => {
    it('returns 401 when no token is provided', async () => {
      await request(app.getHttpServer()).get('/moods').expect(401);

      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
      expect(mockMoodsService.findAll).not.toHaveBeenCalled();
    });

    it('returns 200 when a valid token is provided', async () => {
      const moods = [
        {
          id: 'mood-1',
          mood: 'happy',
          note: 'Had a productive day and felt energized.',
          date: '2026-02-18',
          userId: 'admin-user-id',
        },
      ];

      mockMoodsService.findAll.mockResolvedValue(moods);

      await request(app.getHttpServer())
        .get('/moods')
        .set('Authorization', 'Bearer user-token')
        .expect(200)
        .expect(moods);

      expect(mockMoodsService.findAll).toHaveBeenCalled();
    });
  });
});
