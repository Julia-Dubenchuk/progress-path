import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionDetailsController } from './subscription-details.controller';
import { SubscriptionDetailsService } from './subscription-details.service';

describe('SubscriptionDetailsController', () => {
  let controller: SubscriptionDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionDetailsController],
      providers: [SubscriptionDetailsService],
    }).compile();

    controller = module.get<SubscriptionDetailsController>(SubscriptionDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
