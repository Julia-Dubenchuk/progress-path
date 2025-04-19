import { setSeederFactory } from 'typeorm-extension';
import { Role, RoleName } from '../../roles/entities/role.entity';

export default setSeederFactory(Role, (faker) => {
  const role = new Role();

  const roleName = faker.helpers.arrayElement([
    RoleName.ADMIN,
    RoleName.PREMIUM,
    RoleName.USER,
    RoleName.EDITOR,
    RoleName.MODERATOR,
    RoleName.GUEST,
  ]);

  role.name = roleName;
  role.description = `Description for ${roleName} ${faker.string.alphanumeric(8)}`;

  return role;
});
