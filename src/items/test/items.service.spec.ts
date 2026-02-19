import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from '../items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Item } from '../entities/item.entity';

describe('ItemsService', () => {
  let service: ItemsService;

  const mockItemRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Item),
          useValue: mockItemRepository,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
