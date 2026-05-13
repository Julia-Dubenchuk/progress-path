import { User } from '../users/entities/user.entity';

export type IUpdateOperation<T> = {
  currentUser: User;
  userId: string;
  dto: T;
};
