import { User } from '../users/entities/user.entity';
import { UpdateSubscriptionDetailDto } from './dto/update-subscription-detail.dto';

export interface IUpdateSubscriptionDetail {
  currentUser: User;
  userId: string;
  updateSubscriptionDetailDto: UpdateSubscriptionDetailDto;
}
