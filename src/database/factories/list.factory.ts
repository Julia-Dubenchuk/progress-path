import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/en';
import { List } from '../../lists/entities/list.entity';
import { STATUS } from '../../items/entities/item.entity';

export default setSeederFactory(List, () => {
  const list = new List();

  list.title = faker.lorem.words({ min: 1, max: 5 });
  list.description = faker.lorem.paragraph();
  list.targetDate = faker.date.future();
  list.status = faker.helpers.arrayElement(Object.values(STATUS));

  return list;
});
