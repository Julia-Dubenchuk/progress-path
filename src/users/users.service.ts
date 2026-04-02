import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoggerService } from '../common/logger/logger.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { Role } from '../roles/entities/role.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import { SubscriptionDetail } from '../subscription-details/entities/subscription-detail.entity';
import { IDeleteUserResponse } from './types';
import { OwnershipAuthorizationService } from '../common/authorization/ownership-authorization.service';
import { IUpdateOperation } from '../types/update-operation.type';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly logger: LoggerService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly dataSource: DataSource,
    private readonly ownershipAuthorizationService: OwnershipAuthorizationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { roles, profile, preference, subscriptionDetail, ...userData } =
        createUserDto;

      const userId = uuidv4();

      const userRepository = queryRunner.manager.getRepository(User);
      const profileRepository = queryRunner.manager.getRepository(UserProfile);
      const preferenceRepository =
        queryRunner.manager.getRepository(UserPreference);
      const subscriptionRepository =
        queryRunner.manager.getRepository(SubscriptionDetail);
      const roleRepository = queryRunner.manager.getRepository(Role);

      let user = userRepository.create({ ...userData, id: userId });

      if (preference) {
        user.preference = await preferenceRepository.save({
          ...preference,
          id: userId,
        });
      }

      if (subscriptionDetail) {
        user.subscriptionDetail = await subscriptionRepository.save({
          ...subscriptionDetail,
          id: userId,
        });
      }

      if (roles?.length) {
        user.roles = await roleRepository.find({
          where: { id: In(roles) },
        });
      }

      user = await userRepository.save(user);

      if (profile) {
        user.profile = await profileRepository.save({ ...profile, id: userId });
      }

      await queryRunner.commitTransaction();

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
      await queryRunner.rollbackTransaction();

      this.logger.error(`Failed to create user`, {
        meta: { error },
      });

      void this.activityLogsService.create({
        action: 'USER_CREATE_FAILED',
        description: 'User creation failed.',
        success: false,
      });

      throw new InternalServerErrorException('Failed to create user');
    } finally {
      await queryRunner.release();
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

  async update({
    currentUser,
    userId,
    updateUserDto,
  }: IUpdateOperation<UpdateUserDto, 'updateUserDto'>): Promise<User> {
    this.ownershipAuthorizationService.assertCanManageOwnResourceOrThrow({
      currentUser,
      targetUserId: userId,
      action: 'update user',
      context: UsersService.name,
      forbiddenMessage: 'You are not allowed to update this profile',
    });

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { roles, profile, preference, subscriptionDetail, ...userFields } =
        updateUserDto;

      const userRepository = queryRunner.manager.getRepository(User);
      const profileRepository = queryRunner.manager.getRepository(UserProfile);
      const preferenceRepository =
        queryRunner.manager.getRepository(UserPreference);
      const subscriptionRepository =
        queryRunner.manager.getRepository(SubscriptionDetail);
      const roleRepository = queryRunner.manager.getRepository(Role);

      userRepository.merge(user, userFields);

      if (roles) {
        user.roles = await roleRepository.findBy({ id: In(roles) });
      }

      if (profile) {
        await profileRepository.update(userId, profile);
      }

      if (preference) {
        await preferenceRepository.update(userId, preference);
      }

      if (subscriptionDetail) {
        await subscriptionRepository.update(userId, subscriptionDetail);
      }

      const updatedUser = await userRepository.save(user);

      await queryRunner.commitTransaction();

      void this.activityLogsService.create({
        action: 'USER_UPDATED',
        description: `User ${userId} updated`,
        success: true,
      });

      this.logger.log(`User ${userId} updated successfully`, {
        meta: { id: userId },
      });
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Failed to update user ${userId}`, { meta: error });
      void this.activityLogsService.create({
        action: 'USER_UPDATE_FAILED',
        description: `User update failed for ${userId}`,
        success: false,
      });

      throw error instanceof HttpException
        ? error
        : new InternalServerErrorException('Failed to update user');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(currentUser: User, id: string): Promise<IDeleteUserResponse> {
    this.ownershipAuthorizationService.assertCanManageOwnResourceOrThrow({
      currentUser,
      targetUserId: id,
      action: 'delete user',
      context: UsersService.name,
      forbiddenMessage: 'You are not allowed to delete this user',
    });

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(User);
      const profileRepository = queryRunner.manager.getRepository(UserProfile);
      const preferenceRepository =
        queryRunner.manager.getRepository(UserPreference);
      const subscriptionRepository =
        queryRunner.manager.getRepository(SubscriptionDetail);

      const user = await userRepository.findOne({
        where: { id },
        relations: ['roles'],
      });

      if (!user) {
        this.logger.warn(`User with id ${id} not found for deletion`, {
          meta: { id },
        });
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if (user.roles?.length) {
        await queryRunner.manager
          .createQueryBuilder()
          .relation(User, 'roles')
          .of(user.id)
          .remove(user.roles.map((role) => role.id));
      }

      await profileRepository.delete(id);
      await preferenceRepository.delete(id);
      await subscriptionRepository.delete(id);
      await userRepository.delete(id);

      await queryRunner.commitTransaction();

      void this.activityLogsService.create({
        action: 'USER_DELETED',
        description: `User ${id} deleted`,
        success: true,
      });

      this.logger.log(`User ${id} deleted successfully`, { meta: { id } });
      return { message: `User ${id} deleted successfully` };
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (rollbackError) {
        this.logger.error(
          `Failed to rollback delete transaction for user ${id}`,
          {
            context: UsersService.name,
            meta: { id, rollbackError },
          },
        );
      }

      const err =
        error instanceof Error
          ? { message: error.message, name: error.name, stack: error.stack }
          : { message: String(error) };

      if (error instanceof HttpException) {
        this.logger.warn(`Failed to delete user ${id}`, {
          context: UsersService.name,
          meta: { id, error: err },
        });

        void this.activityLogsService.create({
          action: 'USER_DELETE_FAILED',
          description: `User deletion failed for ${id}: ${err.message}`,
          success: false,
        });

        throw error;
      }

      this.logger.error(`Failed to delete user ${id}`, {
        context: UsersService.name,
        trace: error instanceof Error ? error.stack : undefined,
        meta: { id, error: err },
      });

      void this.activityLogsService.create({
        action: 'USER_DELETE_FAILED',
        description: `User deletion failed for ${id}: ${err.message}`,
        success: false,
      });

      throw new InternalServerErrorException('Failed to delete user');
    } finally {
      await queryRunner.release();
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
