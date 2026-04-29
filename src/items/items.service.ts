import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateItemStatusDto } from './dto/update-item-status.dto';
import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';
import { RoleName } from '../roles/entities/role.entity';
import { List } from '../lists/entities/list.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    await this.ensureListExists(createItemDto.listId);

    const newItem = this.itemRepository.create({
      ...createItemDto,
    });

    return this.itemRepository.save(newItem);
  }

  findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }

    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);

    if (updateItemDto.listId) {
      await this.ensureListExists(updateItemDto.listId);
    }

    const updated = this.itemRepository.merge(item, updateItemDto);

    return this.itemRepository.save(updated);
  }

  async updateStatus(
    currentUser: User,
    id: string,
    updateItemStatusDto: UpdateItemStatusDto,
  ): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['list'],
    });

    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }

    const isAdmin = currentUser.roles?.some(
      (role) => role.name === RoleName.ADMIN,
    );
    const isListOwner = item.list?.userId === currentUser.id;

    if (!isAdmin && !isListOwner) {
      throw new ForbiddenException(
        'You are not allowed to update this item status',
      );
    }

    const updated = this.itemRepository.merge(item, {
      status: updateItemStatusDto.status,
    });

    return this.itemRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.itemRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
  }

  private async ensureListExists(listId: string): Promise<void> {
    const list = await this.listRepository.findOne({ where: { id: listId } });

    if (!list) {
      throw new NotFoundException(`List with id ${listId} not found`);
    }
  }
}
