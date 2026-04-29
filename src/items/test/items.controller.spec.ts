import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemsController } from '../items.controller';
import { ItemsService } from '../items.service';
import { Item } from '../entities/item.entity';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../users/entities/user.entity';
import { STATUS } from '../../common/enums/status.enum';
import { RoleName } from '../../roles/entities/role.entity';
import { List } from '../../lists/entities/list.entity';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

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
        { provide: getRepositoryToken(List), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate item status updates to the service', async () => {
    const itemId = '550e8400-e29b-41d4-a716-446655440000';
    const updateItemStatusDto = { status: STATUS.IN_PROGRESS };
    const currentUser = {
      id: 'user-1',
      roles: [{ name: RoleName.ADMIN }],
    } as User;
    const updateStatusSpy = jest
      .spyOn(service, 'updateStatus')
      .mockResolvedValue({ id: itemId, ...updateItemStatusDto } as Item);

    await controller.updateStatus(currentUser, itemId, updateItemStatusDto);

    expect(updateStatusSpy).toHaveBeenCalledWith(
      currentUser,
      itemId,
      updateItemStatusDto,
    );
  });
});
