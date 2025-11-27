import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { LoggerService } from '../common/logger/logger.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { Role } from '../roles/entities/role.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import { SubscriptionDetail } from '../subscription-details/entities/subscription-detail.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(UserProfile)
    private readonly profilesRepository: Repository<UserProfile>,
    @InjectRepository(UserPreference)
    private readonly preferencesRepository: Repository<UserPreference>,
    @InjectRepository(SubscriptionDetail)
    private readonly subscriptionsRepository: Repository<SubscriptionDetail>,
    private readonly logger: LoggerService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { roles, profile, preference, subscriptionDetail, ...userData } =
        createUserDto;
      const userId = uuidv4();

      let user = this.usersRepository.create({ ...userData, id: userId });

      if (profile) {
        const createdProfile = this.profilesRepository.create({
          ...profile,
          id: userId,
        });

        user.profile = await this.profilesRepository.save(createdProfile);
      }

      if (preference) {
        const createdPreference = this.preferencesRepository.create({
          ...preference,
          id: userId,
        });
        user.preference =
          await this.preferencesRepository.save(createdPreference);
      }

      if (subscriptionDetail) {
        const createdSubscription = this.subscriptionsRepository.create({
          ...subscriptionDetail,
          id: userId,
        });
        user.subscriptionDetail =
          await this.subscriptionsRepository.save(createdSubscription);
      }

      if (roles?.length) {
        user.roles = await this.rolesRepository.find({
          where: { id: In(roles) },
        });
      }

      user = await this.usersRepository.save(user);

      void this.activityLogsService.create({
        action: 'USER_CREATED',
        description: `User ${user.username} created`,
        success: true,
      });

      this.logger.log('User created successfully', {
        meta: { id: user.id, email: user.email },
      });

      return user;
    } catch (error) {
      this.logger.error(`Failed to create user`, {
        meta: { error },
      });

      void this.activityLogsService.create({
        action: 'USER_CREATE_FAILED',
        description: 'User creation failed.',
        success: false,
      });

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['roles', 'profile', 'subscriptionDetail', 'preference'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'profile', 'subscriptionDetail', 'preference'],
    });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { roles, profile, preference, subscriptionDetail, ...userFields } =
      updateUserDto;

    try {
      const updated = this.usersRepository.merge(user, userFields);
      await this.usersRepository.save(updated);

      if (roles) {
        const newRoles = await this.rolesRepository.findBy({ id: In(roles) });
        user.roles = newRoles;
      }

      if (profile) {
        await this.profilesRepository.update(id, profile);
      }

      if (preference) {
        await this.preferencesRepository.update(id, preference);
      }

      if (subscriptionDetail) {
        await this.subscriptionsRepository.update(id, subscriptionDetail);
      }

      void this.activityLogsService.create({
        action: 'USER_UPDATED',
        description: `User ${id} updated`,
        success: true,
      });

      this.logger.log(`User ${id} updated successfully`, { meta: { id } });
      return await this.findOne(id);
    } catch (error) {
      this.logger.error(`Failed to update user ${id}`, { meta: error });

      void this.activityLogsService.create({
        action: 'USER_UPDATE_FAILED',
        description: `User update failed for ${id}`,
        success: false,
      });

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);

      if (result.affected === 0) {
        this.logger.warn(`User with id ${id} not found for deletion`, {
          meta: { id },
        });
        throw new NotFoundException(`User with id ${id} not found`);
      }

      void this.activityLogsService.create({
        action: 'USER_DELETED',
        description: `User ${id} deleted`,
        success: true,
      });

      this.logger.log(`User ${id} deleted successfully`, { meta: { id } });

      await this.preferencesRepository.delete(id);
      await this.profilesRepository.delete(id);
      await this.subscriptionsRepository.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete user ${id}`, {
        meta: { id, error },
      });

      void this.activityLogsService.create({
        action: 'USER_DELETE_FAILED',
        description: `User deletion failed`,
        success: false,
      });

      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    const user = await this.findOne(id);

    if (!user) {
      this.logger.warn(`User not found for password update`, { meta: { id } });
      void this.activityLogsService.create({
        action: 'PASSWORD_UPDATE_FAILED',
        description: `User ${id} not found for password update`,
        success: false,
      });
      throw new NotFoundException(`User with id ${id} not found`);
    }

    user.password = hashedPassword;
    const savedUser = this.usersRepository.save(user);
    void this.activityLogsService.create({
      action: 'PASSWORD_UPDATED',
      description: `Password updated for user ${id}`,
      success: true,
    });

    this.logger.log(`Password updated successfully`, { meta: { id } });
    return savedUser;
  }
}
