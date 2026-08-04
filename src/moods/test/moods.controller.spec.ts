import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoodsController } from '../moods.controller';
import { MoodsService } from '../moods.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../users/entities/user.entity';
import { Mood } from '../entities/mood.entity';

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
    jest.clearAllMocks();

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

  it('should delegate mood list reads with the current user id', async () => {
    const currentUser = { id: 'user-1' } as User;
    const moods = [{ id: 'mood-id' }] as Mood[];

    mockMoodsService.findAll.mockResolvedValue(moods);

    const result = await controller.findAll(currentUser);

    expect(mockMoodsService.findAll).toHaveBeenCalledWith(currentUser);
    expect(result).toEqual(moods);
  });

  it('should delegate single mood reads with the current user id', async () => {
    const moodId = '550e8400-e29b-41d4-a716-446655440000';
    const currentUser = { id: 'user-1' } as User;
    const mood = { id: moodId } as Mood;

    mockMoodsService.findOne.mockResolvedValue(mood);

    const result = await controller.findOne(currentUser, moodId);

    expect(mockMoodsService.findOne).toHaveBeenCalledWith(moodId, currentUser);
    expect(result).toEqual(mood);
  });
});
