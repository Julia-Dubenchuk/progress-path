/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  create(createItemDto: CreateItemDto, _userIdForAudit: string) {
    // _userIdForAudit is used for tracking purposes in our RBAC system
    // but we don't store it directly on the item since it's linked to a list
    const newItem = this.itemRepository.create({
      ...createItemDto,
    });
    return this.itemRepository.save(newItem);
  }

  findAll() {
    return this.itemRepository.find();
  }

  findOne(id: string) {
    return this.itemRepository.findOne({ where: { id } });
  }

  update(id: string, updateItemDto: UpdateItemDto) {
    return this.itemRepository.update(id, updateItemDto);
  }

  remove(id: string) {
    return this.itemRepository.delete(id);
  }
}
