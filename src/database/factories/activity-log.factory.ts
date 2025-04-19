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
  ];

  activityLog.action = faker.helpers.arrayElement(actions);

  return activityLog;
});
