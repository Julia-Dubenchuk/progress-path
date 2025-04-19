import { setSeederFactory } from 'typeorm-extension';
import { Item, STATUS } from '../../items/entities/item.entity';

export default setSeederFactory(Item, (faker) => {
  const item = new Item();

  item.title = `Task ${faker.string.alphanumeric(8)}`;
  item.description = `Description for task ${faker.string.alphanumeric(8)}`;
  item.status = faker.helpers.arrayElement(Object.values(STATUS));
  item.priority = faker.number.int({ min: 1, max: 5 });
  item.targetDate = faker.date.future();

  return item;
});
