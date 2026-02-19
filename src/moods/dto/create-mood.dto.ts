import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateMoodDto {
  @ApiProperty({
    description: 'Mood label',
    example: 'happy',
  })
  @IsString()
  @MaxLength(50)
  mood: string;

  @ApiPropertyOptional({
    description: 'Optional note about the mood',
    example: 'Had a productive day and felt energized.',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Date of the mood entry',
    example: '2026-02-18',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    description: 'Owner user id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  userId: string;
}
