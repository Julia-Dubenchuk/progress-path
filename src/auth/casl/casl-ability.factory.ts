import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
  PureAbility,
} from '@casl/ability';
import { User } from '../../users/entities/user.entity';
import { List } from '../../lists/entities/list.entity';
import { Item } from '../../items/entities/item.entity';
import { RoleName } from '../../roles/entities/role.entity';
import { Action } from '../../permissions/entities/permission.entity';

// Define subjects that can be operated on
type Subjects = InferSubjects<typeof User | typeof List | typeof Item> | 'all';

// Define the ability type that combines actions and subjects
export type AppAbility = PureAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    if (this.hasRole(user, RoleName.ADMIN)) {
      // Admins can do anything
      can(Action.CREATE_LIST, 'all');
      can(Action.EDIT_ITEM, 'all');
      can(Action.DELETE_USER, 'all');
      // Add more admin permissions as needed
    } else if (this.hasRole(user, RoleName.PREMIUM)) {
      // Premium users can create lists and edit their own items
      can(Action.CREATE_LIST, List);
      can(Action.EDIT_ITEM, Item, { userId: user.id });
      // Add more premium permissions as needed
    } else {
      // Regular users have limited permissions
      can(Action.CREATE_LIST, List, { limit: 5 }); // Example of condition - limit to 5 lists
      can(Action.EDIT_ITEM, Item, { userId: user.id });
      // Add more regular user permissions as needed
    }

    return build({
      // Convert object types to their string names for storage/comparison
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  private hasRole(user: User, roleName: RoleName): boolean {
    return user.roles?.some((role) => role.name === roleName) ?? false;
  }
}
