import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { Repository } from 'typeorm';
import { LoggerService } from '../common/logger/logger.service';
import { User } from '../users/entities/user.entity';
import { RoleName } from './../roles/entities/role.entity';
import { IUpdateUserProfile, IUpdateProfilePicture } from './types';

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

  async update({
    currentUser,
    userId,
    updateUserProfileDto,
  }: IUpdateUserProfile): Promise<UserProfile> {
    try {
      const isAdmin = currentUser.roles?.some(
        (role) => role.name === RoleName.ADMIN,
      );

      if (!isAdmin && currentUser.id !== userId) {
        this.logger.warn(
          `User ${currentUser.id} tried to update profile ${userId} without permission`,
          {
            context: UserProfilesService.name,
            meta: {
              currentUserId: currentUser.id,
              targetUserId: userId,
            },
          },
        );

        throw new ForbiddenException(
          'You are not allowed to update this profile',
        );
      }

      const profile = await this.findOne(userId);

      const updated = this.userProfileRepository.merge(
        profile,
        updateUserProfileDto,
      );

      const saved = await this.userProfileRepository.save(updated);

      this.logger.log(`Updated profile for user ${userId}`, {
        context: UserProfilesService.name,
        meta: {
          updatedBy: currentUser.id,
          targetUserId: userId,
        },
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to update profile for user ${userId}`, {
        context: UserProfilesService.name,
        meta: { error, currentUserId: currentUser.id },
      });

      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to update profile');
    }
  }

  async remove(
    currentUser: User,
    userId: string,
  ): Promise<{ message: string }> {
    const isAdmin = currentUser.roles?.some(
      (role) => role.name === RoleName.ADMIN,
    );

    if (!isAdmin && currentUser.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this profile',
      );
    }

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

  async updateProfilePicture({
    currentUser,
    userId,
    buffer,
  }: IUpdateProfilePicture) {
    try {
      const isAdmin = currentUser.roles?.some(
        (role) => role.name === RoleName.ADMIN,
      );

      if (!isAdmin && currentUser.id !== userId) {
        throw new ForbiddenException(
          'You are not allowed to update a picture for this profile',
        );
      }

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
