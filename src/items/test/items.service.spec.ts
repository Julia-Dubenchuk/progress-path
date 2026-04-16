import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from '../items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Item } from '../entities/item.entity';
import { STATUS } from '../../common/enums/status.enum';
import { RoleName } from '../../roles/entities/role.entity';
import { ForbiddenException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

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
    jest.clearAllMocks();

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

  it('should update only the item status', async () => {
    const item = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: STATUS.PLANNED,
      title: 'Buy groceries',
      list: {
        userId: 'owner-id',
      },
    } as Item;
    const updatedItem = {
      ...item,
      status: STATUS.IN_PROGRESS,
    } as Item;
    const currentUser = {
      id: 'owner-id',
      roles: [{ name: RoleName.USER }],
    } as User;

    mockItemRepository.findOne.mockResolvedValue(item);
    mockItemRepository.merge.mockReturnValue(updatedItem);
    mockItemRepository.save.mockResolvedValue(updatedItem);

    const result = await service.updateStatus(currentUser, item.id, {
      status: STATUS.IN_PROGRESS,
    });

    expect(mockItemRepository.findOne).toHaveBeenCalledWith({
      where: { id: item.id },
      relations: ['list'],
    });
    expect(mockItemRepository.merge).toHaveBeenCalledWith(item, {
      status: STATUS.IN_PROGRESS,
    });
    expect(mockItemRepository.save).toHaveBeenCalledWith(updatedItem);
    expect(result).toEqual(updatedItem);
  });

  it('should allow admins to update item status even if they do not own the list', async () => {
    const item = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: STATUS.PLANNED,
      list: {
        userId: 'owner-id',
      },
    } as Item;
    const updatedItem = {
      ...item,
      status: STATUS.COMPLETED,
    } as Item;
    const currentUser = {
      id: 'admin-id',
      roles: [{ name: RoleName.ADMIN }],
    } as User;

    mockItemRepository.findOne.mockResolvedValue(item);
    mockItemRepository.merge.mockReturnValue(updatedItem);
    mockItemRepository.save.mockResolvedValue(updatedItem);

    const result = await service.updateStatus(currentUser, item.id, {
      status: STATUS.COMPLETED,
    });

    expect(result).toEqual(updatedItem);
  });

  it('should reject users who are neither admins nor list owners', async () => {
    const item = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: STATUS.PLANNED,
      list: {
        userId: 'owner-id',
      },
    } as Item;
    const currentUser = {
      id: 'another-user-id',
      roles: [{ name: RoleName.USER }],
    } as User;

    mockItemRepository.findOne.mockResolvedValue(item);

    await expect(
      service.updateStatus(currentUser, item.id, {
        status: STATUS.IN_PROGRESS,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(mockItemRepository.merge).not.toHaveBeenCalled();
    expect(mockItemRepository.save).not.toHaveBeenCalled();
  });
});
