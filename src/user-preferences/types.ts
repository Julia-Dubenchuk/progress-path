import { User } from '../users/entities/user.entity';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

export interface IUpdateUserPreference {
  currentUser: User;
  userId: string;
  updateUserPreferenceDto: UpdateUserPreferenceDto;
}
