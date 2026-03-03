import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { User } from '../../users/entities/user.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        RolesGuard,
        { provide: getRepositoryToken(User), useValue: {} },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
