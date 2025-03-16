import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDetailDto } from './dto/create-subscription-detail.dto';
import { UpdateSubscriptionDetailDto } from './dto/update-subscription-detail.dto';

@Injectable()
export class SubscriptionDetailsService {
  create(createSubscriptionDetailDto: CreateSubscriptionDetailDto) {
    return 'This action adds a new subscriptionDetail';
  }

  findAll() {
    return `This action returns all subscriptionDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscriptionDetail`;
  }

  update(id: number, updateSubscriptionDetailDto: UpdateSubscriptionDetailDto) {
    return `This action updates a #${id} subscriptionDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscriptionDetail`;
  }
}
