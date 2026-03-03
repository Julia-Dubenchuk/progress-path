import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemsController } from '../items.controller';
import { ItemsService } from '../items.service';
import { Item } from '../entities/item.entity';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../users/entities/user.entity';

describe('ItemsController', () => {
  let controller: ItemsController;

  const mockItemRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockResolvedValue({}),
    merge: jest.fn().mockReturnValue({}),
    delete: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        ItemsService,
        RolesGuard,
        {
          provide: getRepositoryToken(Item),
          useValue: mockItemRepository,
        },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
