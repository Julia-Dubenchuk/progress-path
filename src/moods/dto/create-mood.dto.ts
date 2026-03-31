import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
