import { DataSource, Repository } from 'typeorm';
import { Seeder, SeederFactory, SeederFactoryManager } from 'typeorm-extension';
import { v4 as uuidv4 } from 'uuid';
import { Role, RoleName } from '../../roles/entities/role.entity';
import {
  Action,
  Permission,
} from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import { UserProfile } from '../../user-profiles/entities/user-profile.entity';
import { UserPreference } from '../../user-preferences/entities/user-preference.entity';
import {
  PaymentStatus,
  SubscriptionDetail,
  SubscriptionType,
} from '../../subscription-details/entities/subscription-detail.entity';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';

const ACTIVITY_LOGS_COUNT = 6;
const TEST_EMAIL = 'test@example.com';

export default class InitialDataSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const profileRepository = dataSource.getRepository(UserProfile);
    const preferenceRepository = dataSource.getRepository(UserPreference);
    const subscriptionRepository = dataSource.getRepository(SubscriptionDetail);
    const permissionRepository = dataSource.getRepository(Permission);
    const roleRepository = dataSource.getRepository(Role);
    const activityLogRepository = dataSource.getRepository(ActivityLog);

    const permissionFactory = factoryManager.get(Permission);
    const activityLogFactory = factoryManager.get(ActivityLog);

    const permissionActions = Object.values(Action);

    const permissions: Permission[] = [];

    for (let i = 0; i < permissionActions.length; i++) {
      const permission = await permissionFactory.make();

      const existingPerm = await permissionRepository.findOne({
        where: { action: permission.action },
      });

      const existingPermTemp = permissions.some(
        (p) => p.action === permission.action,
      );

      if (existingPermTemp) continue;

      if (existingPerm) {
        permissions.push(existingPerm);
        continue;
      }

      const savedPermission = await permissionRepository.save(permission);
      permissions.push(savedPermission);
    }

    const roleFactory = factoryManager.get(Role);
    const userProfileFactory = factoryManager.get(UserProfile);
    const userPreferenceFactory = factoryManager.get(UserPreference);
    const subscriptionDetailFactory = factoryManager.get(SubscriptionDetail);
    const userFactory = factoryManager.get(User);

    const roleNames = [...Object.values(RoleName)];

    for (let i = 0; i < roleNames.length; i++) {
      const role = await roleFactory.make();

      if (roleNames[i] === RoleName.TEST) {
        role.name = RoleName.TEST;
        role.description = 'Testing';
      }

      const userId = uuidv4();

      const subscriptionDetail = await subscriptionDetailFactory.make({
        id: userId,
      });

      const existingRole = await roleRepository.findOne({
        where: { name: role.name },
      });

      if (existingRole) continue;

      switch (role.name) {
        case RoleName.ADMIN:
          role.permissions = permissions;
          subscriptionDetail.type = SubscriptionType.PREMIUM;
          subscriptionDetail.paymentStatus = PaymentStatus.PAID;
          break;
        case RoleName.USER:
          role.permissions = permissions.filter((p) => {
            return (
              p.action.startsWith('create') ||
              p.action.startsWith('update') ||
              p.action.startsWith('read')
            );
          });
          break;
        case RoleName.GUEST:
          role.permissions = permissions.filter((p) => {
            return p.action.startsWith('read');
          });
          subscriptionDetail.type = SubscriptionType.FREE;
          subscriptionDetail.paymentStatus = PaymentStatus.CANCELED;
          break;
        case RoleName.PREMIUM:
          role.permissions = permissions.filter((p) => {
            return (
              p.action.startsWith('create') ||
              p.action.startsWith('update') ||
              p.action.startsWith('read') ||
              p.action.startsWith('export') ||
              p.action.startsWith('view')
            );
          });
          subscriptionDetail.type = SubscriptionType.PREMIUM;
          subscriptionDetail.paymentStatus = PaymentStatus.PAID;
          break;
        case RoleName.EDITOR:
          role.permissions = permissions.filter((p) => {
            return (
              p.action.startsWith('create') ||
              p.action.startsWith('update') ||
              p.action.startsWith('read') ||
              p.action.startsWith('delete') ||
              p.action.startsWith('approve')
            );
          });
          break;
        case RoleName.MODERATOR:
          role.permissions = permissions.filter((p) => {
            return (
              p.action.startsWith('manage') ||
              p.action.startsWith('read') ||
              p.action.startsWith('delete')
            );
          });
          subscriptionDetail.type = SubscriptionType.PREMIUM;
          subscriptionDetail.paymentStatus = PaymentStatus.PAID;
          break;
        case RoleName.TEST:
          role.permissions = permissions;
          break;
        default:
          return;
      }

      await roleRepository.save(role);

      const userProfile = await userProfileFactory.make({ id: userId });
      const userPreference = await userPreferenceFactory.make({ id: userId });

      const user = await userFactory.make(
        role.name === RoleName.TEST
          ? { id: userId, email: TEST_EMAIL }
          : { id: userId },
      );

      const existingUser = await userRepository.findOne({
        where: { email: user.email },
        relations: ['roles'],
      });

      if (existingUser) continue;

      await profileRepository.save(userProfile);
      await preferenceRepository.save(userPreference);
      await subscriptionRepository.save(subscriptionDetail);

      user.roles = [role];

      // Connect relationships
      user.profile = userProfile;
      user.preference = userPreference;
      user.subscriptionDetail = subscriptionDetail;

      await userRepository.save(user);
      await this.createActivityLogs(
        activityLogRepository,
        activityLogFactory,
        user,
      );
    }
  }

  private async createActivityLogs(
    activityLogRepository: Repository<ActivityLog>,
    activityLogFactory: SeederFactory<ActivityLog>,
    user: User,
  ): Promise<void> {
    const existingLogs = await activityLogRepository.find();

    if (existingLogs.length > 0) return;

    for (let i = 0; i < ACTIVITY_LOGS_COUNT; i++) {
      const log = await activityLogFactory.make();

      const existingLog = await activityLogRepository.findOne({
        where: { id: log.id, userId: user.id },
      });

      if (existingLog) continue;

      log.user = user;
      log.userId = user.id;

      await activityLogRepository.save(log);
    }
  }
}
