import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoodsController } from '../moods.controller';
import { MoodsService } from '../moods.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../users/entities/user.entity';

describe('MoodsController', () => {
  let controller: MoodsController;
  const mockMoodsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoodsController],
      providers: [
        RolesGuard,
        { provide: getRepositoryToken(User), useValue: {} },
        {
          provide: MoodsService,
          useValue: mockMoodsService,
        },
      ],
    }).compile();

    controller = module.get<MoodsController>(MoodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
