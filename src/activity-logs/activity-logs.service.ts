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

  async create(createActivityLogDto: CreateActivityLogDto): Promise<void> {
    await this.safeLog(async () => {
      const log = this.activityLogRepository.create(createActivityLogDto);
      await this.activityLogRepository.save(log);
    }, createActivityLogDto);
  }

  async createTransactional(
    manager: EntityManager,
    createDto: CreateActivityLogDto,
  ): Promise<void> {
    await this.safeLog(async () => {
      const log = manager.create(ActivityLog, createDto);
      await manager.save(log);
    }, createDto);
  }

  private async safeLog(
    action: () => Promise<void>,
    dto: CreateActivityLogDto,
  ): Promise<void> {
    try {
      await action();
      this.logger.log('Activity log created successfully', {
        context: ActivityLogsService.name,
        meta: {
          action: dto.action,
          ip: dto.ip,
          success: dto.success,
        },
      });
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { message: String(error) };

      this.logger.warn('Failed to create activity log', {
        context: ActivityLogsService.name,
        meta: {
          error: err,
          action: dto.action,
          ip: dto.ip,
          description: dto.description,
        },
      });
    }
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
