import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RoleName } from '../entities/role.entity';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    enum: RoleName,
    example: RoleName.USER,
  })
  @IsEnum(RoleName)
  @IsNotEmpty()
  name: RoleName;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Standard user role',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Permission IDs assigned to the role',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  permissions?: string[];
}
