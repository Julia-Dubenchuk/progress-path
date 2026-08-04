import { RoleName } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';

export function isAdminUser(user: User): boolean {
  return user.roles?.some((role) => role.name === RoleName.ADMIN) ?? false;
}

export function getOwnerScopedWhere<
  TOwnerWhere extends object,
  TAdminWhere extends object | undefined = undefined,
>(
  currentUser: User,
  ownerWhere: TOwnerWhere,
  adminWhere?: TAdminWhere,
): TOwnerWhere | TAdminWhere | undefined {
  return isAdminUser(currentUser) ? adminWhere : ownerWhere;
}
