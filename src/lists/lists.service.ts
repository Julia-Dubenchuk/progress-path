import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './entities/list.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(createListDto: CreateListDto): Promise<List> {
    const list = this.listRepository.create(createListDto);
    return this.listRepository.save(list);
  }

  findAll(): Promise<List[]> {
    return this.listRepository.find();
  }

  async findOne(id: string): Promise<List> {
    const list = await this.listRepository.findOne({ where: { id } });

    if (!list) {
      throw new NotFoundException(`List with id ${id} not found`);
    }

    return list;
  }

  async update(id: string, updateListDto: UpdateListDto): Promise<List> {
    const list = await this.findOne(id);
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
