import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Theme } from '../entities/user-preference.entity';

export class CreateUserPreferenceDto {
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @IsOptional()
  @IsString()
  notificationSettings?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
