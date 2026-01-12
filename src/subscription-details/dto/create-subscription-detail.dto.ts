import { IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SubscriptionType,
  PaymentStatus,
} from '../entities/subscription-detail.entity';

export class CreateSubscriptionDetailDto {
  @ApiProperty({ enum: SubscriptionType })
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
