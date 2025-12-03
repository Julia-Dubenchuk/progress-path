import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Theme } from '../entities/user-preference.entity';

export class CreateUserPreferenceDto {
  @ApiPropertyOptional({ enum: Theme })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notificationSettings?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;
}
