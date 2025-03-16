import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionDetailsService } from './subscription-details.service';

describe('SubscriptionDetailsService', () => {
  let service: SubscriptionDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionDetailsService],
    }).compile();

    service = module.get<SubscriptionDetailsService>(SubscriptionDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
