import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { List } from '../entities/list.entity';

export class PaginatedListsResponseDto {
  @ApiProperty({ type: [List] })
  data!: List[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
