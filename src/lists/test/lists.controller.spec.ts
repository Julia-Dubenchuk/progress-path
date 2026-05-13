import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListsController } from '../lists.controller';
import { ListsService } from '../lists.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../users/entities/user.entity';

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    const result = controller.findAll({ page: 2, limit: 5 });

    expect(mockListsService.findAll).toHaveBeenCalledWith(2, 5);
    expect(result).toBe(paginatedResponse);
  });
});
