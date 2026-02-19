import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { STATUS } from '../entities/item.entity';

export class CreateItemDto {
  @ApiProperty({
    description: 'The title of the item',
    example: 'Buy groceries',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description of the item',
    example: 'Need to buy milk, eggs, and bread',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Current status of the item',
    enum: STATUS,
    example: STATUS.PLANNED,
  })
  @IsEnum(STATUS)
  status: STATUS;

  @ApiProperty({
    description: 'Priority value from 1 (low) to 5 (high)',
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  priority: number;

  @ApiProperty({
    description: 'List id to which this item belongs',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  listId: string;

  @ApiProperty({
    description: 'Optional target date',
    example: '2026-03-10',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  targetDate?: Date;
}
