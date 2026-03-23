import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/en';
import {
  ActivityLog,
  ActivitySource,
} from '../../activity-logs/entities/activity-log.entity';

export default setSeederFactory(ActivityLog, () => {
  const activityLog = new ActivityLog();
  const fallbackEmail = `${faker.string.alphanumeric(10).toLowerCase()}@example.com`;

  const actions = [
    'LOGIN',
    'LOGOUT',
    'CREATED_ITEM',
    'UPDATED_LIST',
    'DELETED_ITEM',
    'COMPLETED_TASK',
    'FORGOT_PASSWORD_REQUEST',
    'PASSWORD_RESET',
  ];

  activityLog.action = faker.helpers.arrayElement(actions);
  activityLog.userId = faker.datatype.boolean()
    ? faker.string.uuid()
    : undefined;
  activityLog.ip = faker.internet.ip();
  activityLog.source = ActivitySource.SYSTEM;

  switch (activityLog.action) {
    case 'FORGOT_PASSWORD_REQUEST':
      activityLog.meta = {
        emailRequested: fallbackEmail,
        reason: faker.helpers.arrayElement([
          'user_initiated',
          'admin_initiated',
        ]),
      };
      break;

    case 'PASSWORD_RESET':
      activityLog.meta = {
        method: 'token',
        note: faker.helpers.arrayElement([
          'reset_via_email_link',
          'reset_via_admin',
        ]),
      };
      break;

    case 'CREATED_ITEM':
      activityLog.meta = {
        itemId: faker.string.uuid(),
        itemType: faker.helpers.arrayElement(['list', 'mood']),
      };
      break;

    case 'UPDATED_LIST':
      activityLog.meta = {
        listId: faker.string.uuid(),
        changes: faker.lorem.sentence(),
      };
      break;

    case 'DELETED_ITEM':
      activityLog.meta = {
        itemId: faker.string.uuid(),
        reason: faker.lorem.words(3),
      };
      break;

    case 'COMPLETED_TASK':
      activityLog.meta = {
        taskId: faker.string.uuid(),
        durationMinutes: faker.number.int({ min: 1, max: 300 }),
      };
      break;

    default:
      activityLog.meta = null;
  }

  activityLog.createdAt = faker.date.recent({ days: 90 });

  return activityLog;
});
