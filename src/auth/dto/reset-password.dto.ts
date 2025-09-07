import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description:
      'Raw password reset token received in email link (query param or body)',
    example: 'f3b1d4a6... (64 hex chars)',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password (min length 8 recommended)',
    example: 'MyN3w$trongP@ss',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
