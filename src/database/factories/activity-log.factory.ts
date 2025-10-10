import { setSeederFactory } from 'typeorm-extension';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';

export default setSeederFactory(ActivityLog, (faker) => {
  const activityLog = new ActivityLog();

  const actions = [
    'login',
    'logout',
    'created_item',
    'updated_list',
    'deleted_item',
    'completed_task',
    'password_reset_requested',
    'password_reset',
  ];

  activityLog.action = faker.helpers.arrayElement(actions);
  activityLog.userId = faker.datatype.boolean()
    ? faker.string.uuid()
    : undefined;
  activityLog.ip = faker.internet.ip();

  switch (activityLog.action) {
    case 'password_reset_requested':
      activityLog.meta = {
        emailRequested: faker.internet.email(),
        reason: faker.helpers.arrayElement([
          'user_initiated',
          'admin_initiated',
        ]),
      };
      break;

    case 'password_reset':
      activityLog.meta = {
        method: 'token',
        note: faker.helpers.arrayElement([
          'reset_via_email_link',
          'reset_via_admin',
        ]),
      };
      break;

    case 'created_item':
      activityLog.meta = {
        itemId: faker.string.uuid(),
        itemType: faker.helpers.arrayElement(['list', 'mood']),
      };
      break;

    case 'updated_list':
      activityLog.meta = {
        listId: faker.string.uuid(),
        changes: faker.lorem.sentence(),
      };
      break;

    case 'deleted_item':
      activityLog.meta = {
        itemId: faker.string.uuid(),
        reason: faker.lorem.words(3),
      };
      break;

    case 'completed_task':
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
