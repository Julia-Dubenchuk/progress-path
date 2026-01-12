import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UserPreference } from './entities/user-preference.entity';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private readonly userPreferenceRepository: Repository<UserPreference>,
    private readonly logger: LoggerService,
  ) {}

  async create(
    createUserPreferenceDto: CreateUserPreferenceDto,
  ): Promise<UserPreference> {
    this.logger.log('Creating new user preferences', {
      context: UserPreferencesService.name,
      meta: { createUserPreferenceDto },
    });

    const preference = this.userPreferenceRepository.create(
      createUserPreferenceDto,
    );

    const saved = await this.userPreferenceRepository.save(preference);

    this.logger.log('User preferences created successfully', {
      context: UserPreferencesService.name,
      meta: { id: saved.id },
    });

    return saved;
  }

  async findAll(): Promise<UserPreference[]> {
    this.logger.log('Fetching all user preferences', {
      context: UserPreferencesService.name,
    });

    const list = await this.userPreferenceRepository.find();

    this.logger.log(`Fetched ${list.length} user preferences`, {
      context: UserPreferencesService.name,
    });

    return list;
  }

  async findOne(userId: string): Promise<UserPreference> {
    this.logger.log(`Fetching preferences for user ${userId}`, {
      context: UserPreferencesService.name,
      meta: { userId },
    });

    const preference = await this.userPreferenceRepository.findOne({
      where: { id: userId },
    });

    if (!preference) {
      this.logger.warn(`Preferences for user ${userId} not found`, {
        context: UserPreferencesService.name,
        meta: { userId },
      });
      throw new NotFoundException(`Preferences for user ${userId} not found`);
    }

    return preference;
  }

  async update(
    userId: string,
    updateUserPreferenceDto: UpdateUserPreferenceDto,
  ): Promise<UserPreference> {
    this.logger.log(`Updating preferences for user ${userId}`, {
      context: UserPreferencesService.name,
      meta: { updateUserPreferenceDto, userId },
    });

    const preference = await this.findOne(userId);

    const updated = this.userPreferenceRepository.merge(
      preference,
      updateUserPreferenceDto,
    );

    const saved = await this.userPreferenceRepository.save(updated);

    this.logger.log(`Preferences updated successfully for user ${userId}`, {
      context: UserPreferencesService.name,
      meta: { userId },
    });

    return saved;
  }

  async remove(userId: string): Promise<{ message: string }> {
    this.logger.log(`Removing preferences for user ${userId}`, {
      context: UserPreferencesService.name,
      meta: { userId },
    });
    const result = await this.userPreferenceRepository.delete(userId);

    if (result.affected === 0) {
      this.logger.warn(
        `Preferences for user ${userId} not found during deletion`,
        { context: UserPreferencesService.name, meta: { userId } },
      );
      throw new NotFoundException(`Preferences for user ${userId} not found`);
    }

    this.logger.log(`Preferences for user ${userId} removed successfully`, {
      context: UserPreferencesService.name,
      meta: { userId },
    });

    return {
      message: 'Preferences successfully deleted!',
    };
  }
}
