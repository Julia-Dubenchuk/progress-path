import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

export interface IUpdateUser {
  currentUser: User;
  id: string;
  updateUserDto: UpdateUserDto;
}
