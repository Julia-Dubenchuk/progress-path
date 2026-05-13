import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListsController } from '../lists.controller';
import { ListsService } from '../lists.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../../auth/decorators/current-user.decorator';

describe('ListsController', () => {
  let controller: ListsController;
  const mockListsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [
        RolesGuard,
        { provide: getRepositoryToken(User), useValue: {} },
        {
          provide: ListsService,
          useValue: mockListsService,
        },
      ],
    }).compile();

    controller = module.get<ListsController>(ListsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const user: JwtPayload = {
      sub: '9e1e4ec1-7b89-456b-9e5a-2d84a58d241b',
      email: 'owner@example.com',
      username: 'owner',
    };

    it('should scope results to the current user', async () => {
      const ownedLists = {
        data: [
          {
            id: 'e763d4ac-f0ca-4867-9dfc-68607143ac2d',
            title: 'Daily wins',
            userId: user.sub,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      mockListsService.findAll.mockResolvedValue(ownedLists);

      const result = await controller.findAll(user, { page: 1, limit: 10 });

      expect(result).toBe(ownedLists);
      expect(mockListsService.findAll).toHaveBeenCalledTimes(1);
      expect(mockListsService.findAll).toHaveBeenCalledWith(user.sub, 1, 10);
    });

    it('passes pagination params to the service', () => {
      const paginatedResponse = {
        data: [],
        meta: {
          page: 2,
          limit: 5,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };
      mockListsService.findAll.mockReturnValue(paginatedResponse);

      const result = controller.findAll(user, { page: 2, limit: 5 });

      expect(mockListsService.findAll).toHaveBeenCalledWith(user.sub, 2, 5);
      expect(result).toBe(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a list only after validating ownership for the current user', async () => {
      const user: JwtPayload = {
        sub: '9e1e4ec1-7b89-456b-9e5a-2d84a58d241b',
        email: 'owner@example.com',
        username: 'owner',
      };
      const listId = 'e763d4ac-f0ca-4867-9dfc-68607143ac2d';
      const ownedList = {
        id: listId,
        title: 'Daily wins',
        userId: user.sub,
      };

      mockListsService.findOne.mockResolvedValue(ownedList);

      const result = await controller.findOne(listId, user);

      expect(result).toBe(ownedList);
      expect(mockListsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockListsService.findOne).toHaveBeenCalledWith(listId, user.sub);
    });
  });
});
