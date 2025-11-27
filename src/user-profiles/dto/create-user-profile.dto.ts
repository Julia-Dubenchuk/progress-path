import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '../entities/user-profile.entity';

export class CreateUserProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  profilePicture?: Buffer;

  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  location?: string;
}
