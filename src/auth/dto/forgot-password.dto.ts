import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address associated with the user account',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}
