import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoodsService } from '../moods.service';
import { Mood } from '../entities/mood.entity';

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
});
