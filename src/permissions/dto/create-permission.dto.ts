import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Action } from '../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission action',
    enum: Action,
    example: Action.READ_USER,
  })
  @IsEnum(Action)
  @IsNotEmpty()
  action: Action;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows reading user data',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Roles related to permissions (UUIDs of Role entities)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  roles?: string[];
}
