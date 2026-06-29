import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListDto } from './dto/create-list.dto';
import { PaginatedListsResponseDto } from './dto/paginated-lists-response.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './entities/list.entity';
import { IUpdateOperation } from 'src/types/update-operation.type.js';
import { User } from '../users/entities/user.entity';
import { getOwnerScopedWhere } from '../common/authorization/owner-scoped-query.util';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(createListDto: CreateListDto, userId: string): Promise<List> {
    const list = this.listRepository.create({
      ...createListDto,
      userId,
    });
    return this.listRepository.save(list);
  }

  async findAll(
    currentUser: User,
    page = 1,
    limit = 10,
  ): Promise<PaginatedListsResponseDto> {
    const where = getOwnerScopedWhere(currentUser, {
      userId: currentUser.id,
    });

    const [data, total] = await this.listRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: total > 0 && page < totalPages,
        hasPreviousPage: total > 0 && page > 1,
      },
    };
  }

  async findOne(id: string, currentUser: User): Promise<List> {
    const where = getOwnerScopedWhere(
      currentUser,
      { id, userId: currentUser.id },
      { id },
    );
    const list = await this.listRepository.findOne({ where });

    if (!list) {
      throw new NotFoundException(`List with id ${id} not found`);
    }

    return list;
  }

  async update({
    currentUser,
    id,
    dto: updateListDto,
  }: IUpdateOperation<UpdateListDto>): Promise<List> {
    const list = await this.findOne(id, currentUser);
    const updated = this.listRepository.merge(list, updateListDto);

    return this.listRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.listRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`List with id ${id} not found`);
    }
  }
}
