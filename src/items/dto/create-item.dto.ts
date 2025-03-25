import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'The title of the item',
    example: 'Buy groceries',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description of the item',
    example: 'Need to buy milk, eggs, and bread',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether the item is completed',
    example: false,
    default: false,
  })
  @IsOptional()
  isCompleted?: boolean;
}
