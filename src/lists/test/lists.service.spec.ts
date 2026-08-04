import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListsService } from '../lists.service';
import { List } from '../entities/list.entity';
import { RoleName } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';

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
    jest.clearAllMocks();

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

  it('returns paginated lists scoped to the current user', async () => {
    const currentUser = {
      id: 'user-uuid',
      roles: [{ name: RoleName.USER }],
    } as User;
    const lists = [{ id: 'list-2' }, { id: 'list-1' }] as List[];
    mockListRepository.findAndCount.mockResolvedValue([lists, 5]);

    const result = await service.findAll(currentUser, 2, 2);

    expect(mockListRepository.findAndCount).toHaveBeenCalledWith({
      where: { userId: currentUser.id },
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

  it('returns paginated lists from all users for admins', async () => {
    const currentUser = {
      id: 'admin-uuid',
      roles: [{ name: RoleName.ADMIN }],
    } as User;
    const lists = [{ id: 'list-2' }, { id: 'list-1' }] as List[];
    mockListRepository.findAndCount.mockResolvedValue([lists, 5]);

    await service.findAll(currentUser, 2, 2);

    expect(mockListRepository.findAndCount).toHaveBeenCalledWith({
      where: undefined,
      order: { createdAt: 'DESC' },
      skip: 2,
      take: 2,
    });
  });

  it('returns both navigation flags as false when total is 0', async () => {
    const currentUser = {
      id: 'user-uuid',
      roles: [{ name: RoleName.USER }],
    } as User;
    mockListRepository.findAndCount.mockResolvedValue([[], 0]);

    const result = await service.findAll(currentUser, 2, 5);

    expect(result.meta).toMatchObject({
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("returns 404 when a regular user requests another user's list", async () => {
    const currentUser = {
      id: 'user-uuid',
      roles: [{ name: RoleName.USER }],
    } as User;
    mockListRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('other-list-id', currentUser)).rejects.toThrow(
      new NotFoundException('List with id other-list-id not found'),
    );
    expect(mockListRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'other-list-id', userId: currentUser.id },
    });
  });

  it('finds one list by id only for admins', async () => {
    const currentUser = {
      id: 'admin-uuid',
      roles: [{ name: RoleName.ADMIN }],
    } as User;
    const list = { id: 'list-id' } as List;
    mockListRepository.findOne.mockResolvedValue(list);

    const result = await service.findOne(list.id, currentUser);

    expect(mockListRepository.findOne).toHaveBeenCalledWith({
      where: { id: list.id },
    });
    expect(result).toBe(list);
  });
});
