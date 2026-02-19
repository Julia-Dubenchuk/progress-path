import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListsService } from '../lists.service';
import { List } from '../entities/list.entity';

describe('ListsService', () => {
  let service: ListsService;

  const mockListRepository = {
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
        ListsService,
        {
          provide: getRepositoryToken(List),
          useValue: mockListRepository,
        },
      ],
    }).compile();

    service = module.get<ListsService>(ListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
