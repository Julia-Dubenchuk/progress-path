import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIP, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty({
    description: 'Type of activity being logged',
    example: 'PASSWORD_RESET_REQUEST',
  })
  action!: string;

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
      'Free-form JSON object with additional contextual data (e.g., resetTokenId, originActionId).',
    example: { resetTokenId: '49d6dd26...', ipCountry: 'UA' },
  })
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  meta?: Record<string, any>;
}
