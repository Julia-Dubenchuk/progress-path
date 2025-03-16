import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDetailDto } from './create-subscription-detail.dto';

export class UpdateSubscriptionDetailDto extends PartialType(CreateSubscriptionDetailDto) {}
