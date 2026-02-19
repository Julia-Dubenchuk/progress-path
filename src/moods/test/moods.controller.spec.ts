import { Test, TestingModule } from '@nestjs/testing';
import { MoodsController } from '../moods.controller';
import { MoodsService } from '../moods.service';

describe('MoodsController', () => {
  let controller: MoodsController;
  const mockMoodsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoodsController],
      providers: [
        {
          provide: MoodsService,
          useValue: mockMoodsService,
        },
      ],
    }).compile();

    controller = module.get<MoodsController>(MoodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
