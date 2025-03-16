import { Module } from '@nestjs/common';
import { SubscriptionDetailsService } from './subscription-details.service';
import { SubscriptionDetailsController } from './subscription-details.controller';

@Module({
  controllers: [SubscriptionDetailsController],
  providers: [SubscriptionDetailsService],
})
export class SubscriptionDetailsModule {}
