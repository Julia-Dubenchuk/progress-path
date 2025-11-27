import { IsEnum, IsDateString, IsOptional } from 'class-validator';
import {
  SubscriptionType,
  PaymentStatus,
} from '../entities/subscription-detail.entity';

export class CreateSubscriptionDetailDto {
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
