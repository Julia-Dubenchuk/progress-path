import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoodsService } from '../moods.service';
import { Mood } from '../entities/mood.entity';
import { NotFoundException } from '@nestjs/common';
import { RoleName } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';

describe('MoodsService', () => {
  let service: MoodsService;

  const mockMoodRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoodsService,
        {
          provide: getRepositoryToken(Mood),
          useValue: mockMoodRepository,
        },
      ],
    }).compile();

    service = module.get<MoodsService>(MoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return only moods owned by the current user', async () => {
    const currentUser = {
      id: 'user-uuid',
      roles: [{ name: RoleName.USER }],
    } as User;
    const moods = [
      {
        id: 'mood-id',
        userId: currentUser.id,
      },
    ] as Mood[];

    mockMoodRepository.find.mockResolvedValue(moods);

    const result = await service.findAll(currentUser);

    expect(mockMoodRepository.find).toHaveBeenCalledWith({
      where: { userId: currentUser.id },
    });
    expect(result).toEqual(moods);
  });

  it('should return moods from all users for admins', async () => {
    const currentUser = {
      id: 'admin-uuid',
      roles: [{ name: RoleName.ADMIN }],
    } as User;
    const moods = [{ id: 'mood-id' }] as Mood[];

    mockMoodRepository.find.mockResolvedValue(moods);

    const result = await service.findAll(currentUser);

    expect(mockMoodRepository.find).toHaveBeenCalledWith({
      where: undefined,
    });
    expect(result).toEqual(moods);
  });

  it('should return one mood only when it belongs to the current user', async () => {
    const moodId = '550e8400-e29b-41d4-a716-446655440000';
    const currentUser = {
      id: 'user-uuid',
      roles: [{ name: RoleName.USER }],
    } as User;
    const mood = {
      id: moodId,
      userId: currentUser.id,
    } as Mood;

    mockMoodRepository.findOne.mockResolvedValue(mood);

    const result = await service.findOne(moodId, currentUser);

    expect(mockMoodRepository.findOne).toHaveBeenCalledWith({
      where: { id: moodId, userId: currentUser.id },
    });
    expect(result).toEqual(mood);
  });

  it('should return one mood by id for admins', async () => {
    const moodId = '550e8400-e29b-41d4-a716-446655440000';
    const currentUser = {
      id: 'admin-uuid',
      roles: [{ name: RoleName.ADMIN }],
    } as User;
    const mood = {
      id: moodId,
    } as Mood;

    mockMoodRepository.findOne.mockResolvedValue(mood);

    const result = await service.findOne(moodId, currentUser);

    expect(mockMoodRepository.findOne).toHaveBeenCalledWith({
      where: { id: moodId },
    });
    expect(result).toEqual(mood);
  });

  it('should reject when a mood does not belong to the current user', async () => {
    const moodId = '550e8400-e29b-41d4-a716-446655440000';
    const currentUser = {
      id: 'user-uuid',
      roles: [{ name: RoleName.USER }],
    } as User;

    mockMoodRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(moodId, currentUser)).rejects.toThrow(
      NotFoundException,
    );
  });
});
