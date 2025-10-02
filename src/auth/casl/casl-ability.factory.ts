import { Injectable } from '@nestjs/common';
import { AbilityBuilder, AbilityClass, PureAbility } from '@casl/ability';
import { User } from '../../users/entities/user.entity';
import { List } from '../../lists/entities/list.entity';
import { Item } from '../../items/entities/item.entity';
import { RoleName } from '../../roles/entities/role.entity';
import { Action } from '../../permissions/entities/permission.entity';
import { Mood } from '../../moods/entities/mood.entity';
import { rolePermissions } from './role-permissions';
import { Role } from './../../roles/entities/role.entity';

type Subjects = typeof List | typeof Mood | typeof Item | typeof User | 'all';

export type AppAbility = PureAbility<[Action, Subjects]>;

export type Conditions = Record<string, any>;
export type Permission = [Action, Subjects, Conditions?];

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    const perms: Permission[] = user.roles?.flatMap((role: Role) => {
      const func = rolePermissions[role.name];
      if (typeof func === 'function') {
        return func(user);
      }

      return [];
    });

    if (perms.length === 0) {
      perms.push(...rolePermissions[RoleName.USER](user));
    }

    perms.forEach(([action, subject, conditions]) =>
      conditions ? can(action, subject, conditions) : can(action, subject),
    );

    return build({
      detectSubjectType: (item: Subjects) => item.constructor.name as never,
    });
  }
}
