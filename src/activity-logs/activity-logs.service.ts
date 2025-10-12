import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLog } from './entities/activity-log.entity';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly logger: LoggerService,
  ) {}

  async create(
    createActivityLogDto: CreateActivityLogDto,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepository.create(createActivityLogDto);
    return await this.activityLogRepository.save(log);
  }

  async createTransactional(
    manager: EntityManager,
    createDto: CreateActivityLogDto,
  ): Promise<ActivityLog> {
    const log = manager.create(ActivityLog, createDto);
    return await manager.save(log);
  }

  async findAll(): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ActivityLog> {
    const log = await this.activityLogRepository.findOne({ where: { id } });

    if (!log) {
      this.logger.error('ActivityLog was not found', {
        context: ActivityLogsService.name,
        meta: { activityLogId: id },
      });
      throw new NotFoundException(`ActivityLog with ID ${id} not found`);
    }

    return log;
  }

  async update(
    id: string,
    updateActivityLogDto: UpdateActivityLogDto,
  ): Promise<ActivityLog> {
    const existing = await this.findOne(id);
    const updated = this.activityLogRepository.merge(
      existing,
      updateActivityLogDto,
    );

    return await this.activityLogRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.activityLogRepository.remove(existing);
  }
}
