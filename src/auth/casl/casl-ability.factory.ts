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
import { Mood } from '../../moods/entities/mood.entity';

// Define subjects that can be operated on
type Subjects =
  | InferSubjects<typeof User | typeof List | typeof Item | typeof Mood>
  | 'all';

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
      const permissionActions = Object.values(Action);
      permissionActions.forEach((action) => {
        can(action, 'all');
      });
    } else if (this.hasRole(user, RoleName.PREMIUM)) {
      can(Action.CREATE_CONTENT, List);
      can(Action.CREATE_CONTENT, Mood);
      can(Action.CREATE_CONTENT, Item);

      can(Action.READ_CONTENT, List, { userId: user.id });
      can(Action.READ_CONTENT, Mood, { userId: user.id });
      can(Action.READ_CONTENT, Item, { userId: user.id });

      can(Action.UPDATE_CONTENT, List, { userId: user.id });
      can(Action.UPDATE_CONTENT, Mood, { userId: user.id });
      can(Action.UPDATE_CONTENT, Item, { userId: user.id });

      can(Action.DELETE_CONTENT, List, { userId: user.id });
      can(Action.DELETE_CONTENT, Mood, { userId: user.id });
      can(Action.DELETE_CONTENT, Item, { userId: user.id });

      can(Action.READ_USER, User, { id: user.id });
      can(Action.UPDATE_USER, User, { id: user.id });
      can(Action.DELETE_USER, User, { id: user.id });
    } else if (this.hasRole(user, RoleName.EDITOR)) {
      can(Action.CREATE_CONTENT, List);
      can(Action.CREATE_CONTENT, Mood);
      can(Action.CREATE_CONTENT, Item);

      can(Action.READ_CONTENT, List, { userId: user.id });
      can(Action.READ_CONTENT, Mood, { userId: user.id });
      can(Action.READ_CONTENT, Item, { userId: user.id });

      can(Action.UPDATE_CONTENT, List, { userId: user.id });
      can(Action.UPDATE_CONTENT, Mood, { userId: user.id });
      can(Action.UPDATE_CONTENT, Item, { userId: user.id });

      can(Action.DELETE_CONTENT, List, { userId: user.id });
      can(Action.DELETE_CONTENT, Mood, { userId: user.id });
      can(Action.DELETE_CONTENT, Item, { userId: user.id });

      can(Action.APPROVE_CONTENT, List, { userId: user.id });
      can(Action.APPROVE_CONTENT, Mood, { userId: user.id });
      can(Action.APPROVE_CONTENT, Item, { userId: user.id });

      can(Action.READ_USER, User, { id: user.id });
      can(Action.UPDATE_USER, User, { id: user.id });
      can(Action.DELETE_USER, User, { id: user.id });
    } else if (this.hasRole(user, RoleName.MODERATOR)) {
      can(Action.READ_CONTENT, List, { userId: user.id });
      can(Action.READ_CONTENT, Mood, { userId: user.id });
      can(Action.READ_CONTENT, Item, { userId: user.id });

      can(Action.DELETE_CONTENT, List, { userId: user.id });
      can(Action.DELETE_CONTENT, Mood, { userId: user.id });
      can(Action.DELETE_CONTENT, Item, { userId: user.id });

      can(Action.MANAGE_COMMENTS, 'all');

      can(Action.READ_USER, User, { id: user.id });
      can(Action.UPDATE_USER, User, { id: user.id });
      can(Action.DELETE_USER, User, { id: user.id });
    } else if (this.hasRole(user, RoleName.GUEST)) {
      can(Action.READ_CONTENT, List, { userId: user.id });
      can(Action.READ_CONTENT, Mood, { userId: user.id });
      can(Action.READ_CONTENT, Item, { userId: user.id });

      can(Action.READ_USER, User, { id: user.id });
      can(Action.UPDATE_USER, User, { id: user.id });
      can(Action.DELETE_USER, User, { id: user.id });
    } else {
      // Regular users have limited permissions
      can(Action.CREATE_CONTENT, List, { limit: 5 });
      can(Action.CREATE_CONTENT, Mood);
      can(Action.CREATE_CONTENT, Item, { limit: 10 });

      can(Action.READ_CONTENT, List, { userId: user.id });
      can(Action.READ_CONTENT, Mood, { userId: user.id });
      can(Action.READ_CONTENT, Item, { userId: user.id });

      can(Action.UPDATE_CONTENT, Item, { userId: user.id });
      can(Action.UPDATE_CONTENT, Mood, { userId: user.id });
      can(Action.UPDATE_CONTENT, Item, { userId: user.id });

      can(Action.DELETE_CONTENT, List, { userId: user.id });
      can(Action.DELETE_CONTENT, Mood, { userId: user.id });
      can(Action.DELETE_CONTENT, Item, { userId: user.id });

      can(Action.READ_USER, User, { id: user.id });
      can(Action.UPDATE_USER, User, { id: user.id });
      can(Action.DELETE_USER, User, { id: user.id });
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
