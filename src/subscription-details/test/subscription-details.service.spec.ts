import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionDetailsService } from '../subscription-details.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionDetail } from '../entities/subscription-detail.entity';
import { LoggerModule } from '../../common/logger/logger.module';
import { OwnershipAuthorizationService } from '../../common/authorization/ownership-authorization.service';

describe('SubscriptionDetailsService', () => {
  let service: SubscriptionDetailsService;

  const mockSubscriptionDetailRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockOwnershipAuthorizationService = {
    assertCanManageOwnResourceOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        SubscriptionDetailsService,
        {
          provide: getRepositoryToken(SubscriptionDetail),
          useValue: mockSubscriptionDetailRepository,
        },
        {
          provide: OwnershipAuthorizationService,
          useValue: mockOwnershipAuthorizationService,
        },
      ],
    }).compile();

    service = module.get<SubscriptionDetailsService>(
      SubscriptionDetailsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
