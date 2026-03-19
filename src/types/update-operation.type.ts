import { User } from '../users/entities/user.entity';

export type IUpdateOperation<TProperty, TKey extends string> = {
  currentUser: User;
  userId: string;
} & Record<TKey, TProperty>;
