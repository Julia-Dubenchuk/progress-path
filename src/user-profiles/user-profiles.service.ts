import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly logger: LoggerService,
  ) {}

  async create(
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    try {
      const profile = this.userProfileRepository.create(createUserProfileDto);
      const saved = await this.userProfileRepository.save(profile);

      this.logger.log(`Created profile for user ${saved.id}`, {
        context: UserProfilesService.name,
        meta: { userId: saved.id },
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to create profile`, {
        context: UserProfilesService.name,
        meta: error,
      });
      throw new InternalServerErrorException('Failed to create profile');
    }
  }

  async findAll(): Promise<UserProfile[]> {
    this.logger.log('Fetching all profiles', {
      context: UserProfilesService.name,
    });

    return this.userProfileRepository.find();
  }

  async findOne(userId: string): Promise<UserProfile> {
    this.logger.log(`Fetching profile for user ${userId}`, {
      context: UserProfilesService.name,
      meta: { userId },
    });

    const profile = await this.userProfileRepository.findOne({
      where: { id: userId },
    });

    if (!profile) {
      this.logger.warn(`Profile for user ${userId} not found`, {
        context: UserProfilesService.name,
        meta: { userId },
      });
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }

    return profile;
  }

  async update(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    try {
      const profile = await this.findOne(userId);

      const updated = this.userProfileRepository.merge(
        profile,
        updateUserProfileDto,
      );

      const saved = await this.userProfileRepository.save(updated);

      this.logger.log(`Updated profile for user ${userId}`, {
        context: UserProfilesService.name,
        meta: { userId },
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to update profile for user ${userId}`, {
        context: UserProfilesService.name,
        meta: error,
      });
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async remove(userId: string): Promise<{ message: string }> {
    const result = await this.userProfileRepository.delete(userId);

    if (result.affected === 0) {
      this.logger.warn(`Profile for user ${userId} not found for deletion`, {
        context: UserProfilesService.name,
        meta: { userId },
      });
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }

    this.logger.log(`Deleted profile for user ${userId}`, {
      context: UserProfilesService.name,
      meta: { userId },
    });

    return {
      message: 'Profile successfully deleted!',
    };
  }

  async updateProfilePicture(userId: string, buffer: Buffer) {
    try {
      const profile = await this.findOne(userId);

      if (!profile) {
        this.logger.warn(
          `Profile for user ${userId} not found for picture update`,
          { context: UserProfilesService.name, meta: { userId } },
        );
        throw new NotFoundException(`Profile for user ${userId} not found`);
      }

      profile.profilePicture = buffer;

      await this.userProfileRepository.save(profile);

      this.logger.log(`Updated profile picture for user ${userId}`, {
        context: UserProfilesService.name,
        meta: { userId },
      });

      return {
        message: 'Profile picture uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to update profile picture for user ${userId}`, {
        context: UserProfilesService.name,
        meta: error,
      });
      throw new InternalServerErrorException(
        'Failed to update profile picture',
      );
    }
  }

  async getProfilePicture(userId: string) {
    this.logger.log(`Fetching profile picture for user ${userId}`, {
      context: UserProfilesService.name,
      meta: { userId },
    });

    const profile = await this.findOne(userId);

    return profile?.profilePicture || null;
  }
}
