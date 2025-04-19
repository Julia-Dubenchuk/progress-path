import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/en';
import {
  Category,
  CategoryTitle,
} from '../../categories/entities/category.entity';

export default setSeederFactory(Category, () => {
  const category = new Category();

  category.title = faker.helpers.arrayElement(Object.values(CategoryTitle));
  category.description = faker.lorem.paragraph();

  return category;
});
