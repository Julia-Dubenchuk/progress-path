import { User } from '../users/entities/user.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

export interface IUpdateProfilePicture {
  currentUser: User;
  userId: string;
  buffer: Buffer;
}

export interface IUpdateUserProfile {
  currentUser: User;
  userId: string;
  updateUserProfileDto: UpdateUserProfileDto;
}
