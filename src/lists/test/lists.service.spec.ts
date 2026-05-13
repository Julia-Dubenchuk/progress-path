import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListsService } from '../lists.service';
import { List } from '../entities/list.entity';

describe('ListsService', () => {
  let service: ListsService;

  const mockListRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
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

  it('returns paginated lists metadata', async () => {
    const lists = [{ id: 'list-2' }, { id: 'list-1' }] as List[];
    mockListRepository.findAndCount.mockResolvedValue([lists, 5]);

    const result = await service.findAll(2, 2);

    expect(mockListRepository.findAndCount).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      skip: 2,
      take: 2,
    });
    expect(result).toEqual({
      data: lists,
      meta: {
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
  });

  it('throws when a list is not found', async () => {
    mockListRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      new NotFoundException('List with id missing-id not found'),
    );
  });
});
