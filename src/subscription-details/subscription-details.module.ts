import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionDetailsService } from './subscription-details.service';
import { SubscriptionDetailsController } from './subscription-details.controller';
import { SubscriptionDetail } from './entities/subscription-detail.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionDetail]),
    AuthorizationModule,
  ],
  controllers: [SubscriptionDetailsController],
  providers: [SubscriptionDetailsService],
  exports: [TypeOrmModule],
})
export class SubscriptionDetailsModule {}
