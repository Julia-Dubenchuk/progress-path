import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/locale/en';
import { User } from '../../users/entities/user.entity';

export default setSeederFactory(User, async () => {
  const user = new User();

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet
    .userName({ firstName, lastName })
    .toLowerCase();

  const password =
    Math.random() > 0.5 ? null : await bcrypt.hash('Password123!', 10);

  user.username = username;
  user.email = faker.internet.email({ firstName, lastName }).toLowerCase();
  user.password = password;
  user.firstName = Math.random() > 0.5 ? firstName : null;
  user.lastName = Math.random() > 0.5 ? lastName : null;
  user.googleId = password ? null : faker.string.uuid();

  return user;
});
