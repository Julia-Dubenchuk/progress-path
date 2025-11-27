import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async create(
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    const profile = this.userProfileRepository.create(createUserProfileDto);
    return this.userProfileRepository.save(profile);
  }

  async findAll(): Promise<UserProfile[]> {
    return this.userProfileRepository.find();
  }

  async findOne(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }

    return profile;
  }

  async update(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const profile = await this.findOne(userId);

    const updated = this.userProfileRepository.merge(
      profile,
      updateUserProfileDto,
    );
    return this.userProfileRepository.save(updated);
  }

  async remove(userId: string): Promise<void> {
    const result = await this.userProfileRepository.delete(userId);

    if (result.affected === 0) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }
  }
}
