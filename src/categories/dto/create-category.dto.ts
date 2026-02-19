import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryTitle } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ enum: CategoryTitle })
  @IsEnum(CategoryTitle)
  title: CategoryTitle;

  @ApiPropertyOptional({
    description: 'Optional category description',
    example: 'Books and reading lists',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
