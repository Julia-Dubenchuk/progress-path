import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Item } from './entities/item.entity';
import { List } from '../lists/entities/list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, List])],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
