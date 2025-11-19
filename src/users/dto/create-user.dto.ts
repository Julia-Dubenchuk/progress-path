import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateUserPreferenceDto } from '../../user-preferences/dto/create-user-preference.dto';
import { CreateUserProfileDto } from '../../user-profiles/dto/create-user-profile.dto';
import { CreateSubscriptionDetailDto } from '../../subscription-details/dto/create-subscription-detail.dto';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'Google ID for OAuth users (optional)',
    example: '1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiPropertyOptional({
    description: 'User roles (UUIDs of Role entities)',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  roles?: string[];

  @ApiPropertyOptional({ type: () => CreateUserProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserProfileDto)
  profile?: CreateUserProfileDto;

  @ApiPropertyOptional({ type: () => CreateUserPreferenceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserPreferenceDto)
  preference?: CreateUserPreferenceDto;

  @ApiPropertyOptional({ type: () => CreateSubscriptionDetailDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSubscriptionDetailDto)
  subscriptionDetail?: CreateSubscriptionDetailDto;
}
