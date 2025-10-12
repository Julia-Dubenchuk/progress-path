import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIP,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ActivitySource } from '../entities/activity-log.entity';

export class CreateActivityLogDto {
  @ApiProperty({
    description: 'Type of activity being logged',
    example: 'PASSWORD_RESET_REQUEST',
  })
  action!: string;

  @ApiPropertyOptional({
    description: 'Short human-readable description of the activity',
    example: 'Requested password reset email',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description:
      'Whether the activity succeeded (e.g., reset token used successfully)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({
    description: 'UUID of the user who triggered the activity',
    example: '8a4d1f6e-4f2b-4f2e-9c7b-0a1d2e3f4b5c',
  })
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description:
      'Client IP address associated with the action (if available). IPv4 or IPv6.',
    example: '91.197.7.0',
  })
  @IsOptional()
  @IsIP()
  ip?: string;

  @ApiPropertyOptional({
    description:
      'Source of the activity (useful to track web vs mobile vs API)',
    enum: ActivitySource,
    example: ActivitySource.WEB,
  })
  @IsOptional()
  @IsEnum(ActivitySource)
  source?: ActivitySource;

  @ApiPropertyOptional({
    description:
      'Free-form JSON object with additional contextual data (e.g., resetTokenId, originActionId).',
    example: { resetTokenId: '49d6dd26...', ipCountry: 'UA' },
  })
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  meta?: Record<string, any>;
}
