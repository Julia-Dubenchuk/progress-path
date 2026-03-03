import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionDetailsController } from '../subscription-details.controller';
import { SubscriptionDetailsService } from '../subscription-details.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionDetail } from '../entities/subscription-detail.entity';
import { LoggerModule } from '../../common/logger/logger.module';

describe('SubscriptionDetailsController', () => {
  let controller: SubscriptionDetailsController;

  const mockSubscriptionDetailRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      controllers: [SubscriptionDetailsController],
      providers: [
        SubscriptionDetailsService,
        {
          provide: getRepositoryToken(SubscriptionDetail),
          useValue: mockSubscriptionDetailRepository,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionDetailsController>(
      SubscriptionDetailsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
