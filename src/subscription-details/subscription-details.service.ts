import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionDetailDto } from './dto/create-subscription-detail.dto';
import { UpdateSubscriptionDetailDto } from './dto/update-subscription-detail.dto';
import { SubscriptionDetail } from './entities/subscription-detail.entity';

@Injectable()
export class SubscriptionDetailsService {
  constructor(
    @InjectRepository(SubscriptionDetail)
    private readonly subscriptionRepository: Repository<SubscriptionDetail>,
  ) {}

  async create(
    createSubscriptionDetailDto: CreateSubscriptionDetailDto,
  ): Promise<SubscriptionDetail> {
    const entity = this.subscriptionRepository.create(
      createSubscriptionDetailDto,
    );
    return this.subscriptionRepository.save(entity);
  }

  async findAll(): Promise<SubscriptionDetail[]> {
    return this.subscriptionRepository.find();
  }

  async findOne(userId: string): Promise<SubscriptionDetail> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: userId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `Subscription detail for user ${userId} not found`,
      );
    }

    return subscription;
  }

  async update(
    userId: string,
    updateSubscriptionDetailDto: UpdateSubscriptionDetailDto,
  ): Promise<SubscriptionDetail> {
    const subscription = await this.findOne(userId);

    const updated = this.subscriptionRepository.merge(
      subscription,
      updateSubscriptionDetailDto,
    );
    return this.subscriptionRepository.save(updated);
  }

  async remove(userId: string): Promise<void> {
    const result = await this.subscriptionRepository.delete(userId);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Subscription detail for user ${userId} not found`,
      );
    }
  }
}
