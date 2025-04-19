import { setSeederFactory } from 'typeorm-extension';
import {
  Permission,
  Action,
} from '../../permissions/entities/permission.entity';

export default setSeederFactory(Permission, (faker) => {
  const permission = new Permission();

  const randomAction = faker.helpers.arrayElement(Object.values(Action));

  permission.action = randomAction;
  permission.description = `Permission to ${randomAction.replace(/-/g, ' ')}`;

  return permission;
});
