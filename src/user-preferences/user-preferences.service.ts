import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UserPreference } from './entities/user-preference.entity';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private readonly userPreferenceRepository: Repository<UserPreference>,
  ) {}

  async create(
    createUserPreferenceDto: CreateUserPreferenceDto,
  ): Promise<UserPreference> {
    const preference = this.userPreferenceRepository.create(
      createUserPreferenceDto,
    );
    return this.userPreferenceRepository.save(preference);
  }

  async findAll(): Promise<UserPreference[]> {
    return this.userPreferenceRepository.find();
  }

  async findOne(userId: string): Promise<UserPreference> {
    const preference = await this.userPreferenceRepository.findOne({
      where: { id: userId },
    });

    if (!preference) {
      throw new NotFoundException(`Preferences for user ${userId} not found`);
    }

    return preference;
  }

  async update(
    userId: string,
    updateUserPreferenceDto: UpdateUserPreferenceDto,
  ): Promise<UserPreference> {
    const preference = await this.findOne(userId);

    const updated = this.userPreferenceRepository.merge(
      preference,
      updateUserPreferenceDto,
    );

    return this.userPreferenceRepository.save(updated);
  }

  async remove(userId: string): Promise<void> {
    const result = await this.userPreferenceRepository.delete(userId);

    if (result.affected === 0) {
      throw new NotFoundException(`Preferences for user ${userId} not found`);
    }
  }
}
