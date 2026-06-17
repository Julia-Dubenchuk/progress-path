import { User } from '../users/entities/user.entity';

export type IUpdateOperation<T> = {
  currentUser: User;
  id: string;
  dto: T;
};

export type IBinaryUpdateOperation = Omit<IUpdateOperation<Buffer>, 'dto'> & {
  payload: Buffer;
};
