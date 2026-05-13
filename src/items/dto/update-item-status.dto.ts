import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { STATUS } from '../../common/enums/status.enum';

export class UpdateItemStatusDto {
  @ApiProperty({
    description: 'New status of the item',
    enum: STATUS,
    example: STATUS.IN_PROGRESS,
  })
  @IsEnum(STATUS)
  status: STATUS;
}
