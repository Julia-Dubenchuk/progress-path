import { RoleName } from '../../roles/entities/role.entity';
import { Action } from '../../permissions/entities/permission.entity';
import { Permission } from './casl-ability.factory';
import { User } from '../../users/entities/user.entity';
import { List } from '../../lists/entities/list.entity';
import { Item } from '../../items/entities/item.entity';
import { Mood } from '../../moods/entities/mood.entity';

type RolePermFn = (user: User) => Permission[];

const permissionActions = Object.values(Action);

export const rolePermissions: Omit<Record<RoleName, RolePermFn>, 'test'> = {
  [RoleName.ADMIN]: () => permissionActions.map((action) => [action, 'all']),

  [RoleName.PREMIUM]: (user) => [
    [Action.CREATE_CONTENT, List],
    [Action.CREATE_CONTENT, Mood],
    [Action.CREATE_CONTENT, Item],
    [Action.READ_CONTENT, List, { userId: user.id }],
    [Action.READ_CONTENT, Mood, { userId: user.id }],
    [Action.READ_CONTENT, Item, { userId: user.id }],

    [Action.UPDATE_CONTENT, List, { userId: user.id }],
    [Action.UPDATE_CONTENT, Mood, { userId: user.id }],
    [Action.UPDATE_CONTENT, Item, { userId: user.id }],

    [Action.DELETE_CONTENT, List, { userId: user.id }],
    [Action.DELETE_CONTENT, Mood, { userId: user.id }],
    [Action.DELETE_CONTENT, Item, { userId: user.id }],

    [Action.READ_USER, User, { id: user.id }],
    [Action.UPDATE_USER, User, { id: user.id }],
    [Action.DELETE_USER, User, { id: user.id }],
  ],

  [RoleName.EDITOR]: (user) => [
    [Action.CREATE_CONTENT, List],
    [Action.CREATE_CONTENT, Mood],
    [Action.CREATE_CONTENT, Item],

    [Action.READ_CONTENT, List, { userId: user.id }],
    [Action.READ_CONTENT, Mood, { userId: user.id }],
    [Action.READ_CONTENT, Item, { userId: user.id }],

    [Action.UPDATE_CONTENT, List, { userId: user.id }],
    [Action.UPDATE_CONTENT, Mood, { userId: user.id }],
    [Action.UPDATE_CONTENT, Item, { userId: user.id }],

    [Action.DELETE_CONTENT, List, { userId: user.id }],
    [Action.DELETE_CONTENT, Mood, { userId: user.id }],
    [Action.DELETE_CONTENT, Item, { userId: user.id }],

    [Action.READ_USER, User, { id: user.id }],
    [Action.UPDATE_USER, User, { id: user.id }],
    [Action.DELETE_USER, User, { id: user.id }],
  ],

  [RoleName.MODERATOR]: (user) => [
    [Action.READ_CONTENT, List, { userId: user.id }],
    [Action.READ_CONTENT, Mood, { userId: user.id }],
    [Action.READ_CONTENT, Item, { userId: user.id }],

    [Action.DELETE_CONTENT, List, { userId: user.id }],
    [Action.DELETE_CONTENT, Mood, { userId: user.id }],
    [Action.DELETE_CONTENT, Item, { userId: user.id }],

    [Action.MANAGE_COMMENTS, 'all'],

    [Action.READ_USER, User, { id: user.id }],
    [Action.UPDATE_USER, User, { id: user.id }],
    [Action.DELETE_USER, User, { id: user.id }],
  ],

  [RoleName.GUEST]: (user) => [
    [Action.READ_CONTENT, List, { userId: user.id }],
    [Action.READ_CONTENT, Mood, { userId: user.id }],
    [Action.READ_CONTENT, Item, { userId: user.id }],

    [Action.READ_USER, User, { id: user.id }],
    [Action.UPDATE_USER, User, { id: user.id }],
    [Action.DELETE_USER, User, { id: user.id }],
  ],

  [RoleName.USER]: (user) => [
    [Action.CREATE_CONTENT, List, { limit: 5 }],
    [Action.CREATE_CONTENT, Mood],
    [Action.CREATE_CONTENT, Item, { limit: 10 }],

    [Action.READ_CONTENT, List, { userId: user.id }],
    [Action.READ_CONTENT, Mood, { userId: user.id }],
    [Action.READ_CONTENT, Item, { userId: user.id }],

    [Action.UPDATE_CONTENT, List, { userId: user.id }],
    [Action.UPDATE_CONTENT, Mood, { userId: user.id }],
    [Action.UPDATE_CONTENT, Item, { userId: user.id }],

    [Action.DELETE_CONTENT, List, { userId: user.id }],
    [Action.DELETE_CONTENT, Mood, { userId: user.id }],
    [Action.DELETE_CONTENT, Item, { userId: user.id }],

    [Action.READ_USER, User, { id: user.id }],
    [Action.UPDATE_USER, User, { id: user.id }],
    [Action.DELETE_USER, User, { id: user.id }],
  ],
};
