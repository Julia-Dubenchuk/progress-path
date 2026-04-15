import { List } from '../entities/list.entity';

export class PaginatedListsResponseDto {
  data: List[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
