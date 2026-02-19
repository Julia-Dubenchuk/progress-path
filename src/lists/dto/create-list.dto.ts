import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { STATUS } from '../../items/entities/item.entity';

export class CreateListDto {
  @ApiProperty({
    description: 'List title',
    example: 'Weekly goals',
  })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Track the top priorities for this week.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'User id',
    example: '2cf9f2d8-a8f8-4f7e-ab1e-e4f2d03747c9',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Target completion date',
    example: '2026-03-01',
  })
  @IsOptional()
  @IsDateString()
  targetDate?: Date;

  @ApiProperty({ enum: STATUS })
  @IsEnum(STATUS)
  status: STATUS;
}
