import { getOwnerScopedWhere, isAdminUser } from './owner-scoped-query.util';
import { RoleName } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';

describe('owner-scoped query utils', () => {
  const admin = {
    id: 'admin-id',
    roles: [{ name: RoleName.ADMIN }],
  } as User;

  const regularUser = {
    id: 'user-id',
    roles: [{ name: RoleName.USER }],
  } as User;

  it('detects admin users', () => {
    expect(isAdminUser(admin)).toBe(true);
    expect(isAdminUser(regularUser)).toBe(false);
  });

  it('returns undefined owner scope for admins', () => {
    expect(getOwnerScopedWhere(admin, { userId: admin.id })).toBeUndefined();
  });

  it('returns owner scope for regular users', () => {
    expect(
      getOwnerScopedWhere(regularUser, { userId: regularUser.id }),
    ).toEqual({
      userId: regularUser.id,
    });
  });

  it('returns the admin where shape when one is provided', () => {
    expect(
      getOwnerScopedWhere(
        admin,
        { id: 'entity-id', userId: admin.id },
        { id: 'entity-id' },
      ),
    ).toEqual({ id: 'entity-id' });

    expect(
      getOwnerScopedWhere(
        regularUser,
        { id: 'entity-id', userId: regularUser.id },
        { id: 'entity-id' },
      ),
    ).toEqual({ id: 'entity-id', userId: regularUser.id });
  });
});
