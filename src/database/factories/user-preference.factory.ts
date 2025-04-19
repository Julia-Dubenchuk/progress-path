import { setSeederFactory } from 'typeorm-extension';
import {
  UserPreference,
  Theme,
} from '../../user-preferences/entities/user-preference.entity';

export default setSeederFactory(UserPreference, (faker) => {
  const userPreference = new UserPreference();

  userPreference.theme = faker.helpers.arrayElement(Object.values(Theme));
  userPreference.notificationSettings = JSON.stringify({
    email: faker.datatype.boolean(),
    push: faker.datatype.boolean(),
    sms: faker.datatype.boolean(),
  });
  userPreference.language = faker.helpers.arrayElement([
    'en',
    'es',
    'fr',
    'de',
    'ja',
  ]);

  return userPreference;
});
