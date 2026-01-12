import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionDetailDto } from './dto/create-subscription-detail.dto';
import { UpdateSubscriptionDetailDto } from './dto/update-subscription-detail.dto';
import { SubscriptionDetail } from './entities/subscription-detail.entity';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class SubscriptionDetailsService {
  constructor(
    @InjectRepository(SubscriptionDetail)
    private readonly subscriptionRepository: Repository<SubscriptionDetail>,
    private readonly logger: LoggerService,
  ) {}

  async create(
    createSubscriptionDetailDto: CreateSubscriptionDetailDto,
  ): Promise<SubscriptionDetail> {
    this.logger.log('Creating subscription detail', {
      context: SubscriptionDetailsService.name,
      meta: { createSubscriptionDetailDto },
    });
    const entity = this.subscriptionRepository.create(
      createSubscriptionDetailDto,
    );
    const saved = await this.subscriptionRepository.save(entity);

    this.logger.log('Subscription detail created successfully', {
      context: SubscriptionDetailsService.name,
      meta: { userId: saved.id },
    });

    return saved;
  }

  async findAll(): Promise<SubscriptionDetail[]> {
    this.logger.log('Fetching all subscription details', {
      context: SubscriptionDetailsService.name,
    });
    const list = await this.subscriptionRepository.find();

    this.logger.log(`Fetched ${list.length} subscription records`, {
      context: SubscriptionDetailsService.name,
    });

    return list;
  }

  async findOne(userId: string): Promise<SubscriptionDetail> {
    this.logger.log(`Fetching subscription detail for user ${userId}`, {
      context: SubscriptionDetailsService.name,
      meta: { userId },
    });
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: userId },
    });

    if (!subscription) {
      this.logger.warn(`Subscription detail for user ${userId} not found`, {
        context: SubscriptionDetailsService.name,
        meta: { userId },
      });
      throw new NotFoundException(
        `Subscription detail for user ${userId} not found`,
      );
    }

    this.logger.log(`Subscription detail found for user ${userId}`, {
      context: SubscriptionDetailsService.name,
      meta: { userId },
    });

    return subscription;
  }

  async update(
    userId: string,
    updateSubscriptionDetailDto: UpdateSubscriptionDetailDto,
  ): Promise<SubscriptionDetail> {
    this.logger.log(`Updating subscription detail for user ${userId}`, {
      context: SubscriptionDetailsService.name,
      meta: { updateSubscriptionDetailDto, userId },
    });
    const subscription = await this.findOne(userId);

    const updated = this.subscriptionRepository.merge(
      subscription,
      updateSubscriptionDetailDto,
    );

    const saved = await this.subscriptionRepository.save(updated);

    this.logger.log(
      `Subscription detail updated successfully for user ${userId}`,
      { context: SubscriptionDetailsService.name, meta: { userId } },
    );

    return saved;
  }

  async remove(userId: string): Promise<{ message: string }> {
    this.logger.log(`Removing subscription detail for user ${userId}`, {
      context: SubscriptionDetailsService.name,
      meta: { userId },
    });
    const result = await this.subscriptionRepository.delete(userId);

    if (result.affected === 0) {
      this.logger.warn(
        `Subscription detail for user ${userId} not found during deletion`,
        { context: SubscriptionDetailsService.name, meta: { userId } },
      );
      throw new NotFoundException(
        `Subscription detail for user ${userId} not found`,
      );
    }

    this.logger.log(
      `Subscription detail for user ${userId} removed successfully`,
      { context: SubscriptionDetailsService.name, meta: { userId } },
    );
    return {
      message: 'Subscription detail successfully deleted!',
    };
  }
}
