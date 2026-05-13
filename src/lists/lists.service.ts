import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListDto } from './dto/create-list.dto';
import { PaginatedListsResponseDto } from './dto/paginated-lists-response.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './entities/list.entity';
import { IUpdateOperation } from 'src/types/update-operation.type.js';

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
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedListsResponseDto> {
    const [data, total] = await this.listRepository.findAndCount({
      where: { userId },
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
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<List> {
    const list = await this.listRepository.findOne({ where: { id, userId } });

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
    const list = await this.findOne(id, currentUser.id);
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
