import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { ItemsAdminController } from './controllers/items-admin.controller';
import { Item } from './entities/item.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Item]), AuthModule],
  controllers: [ItemsController, ItemsAdminController],
  providers: [ItemsService],
})
export class ItemsModule {}
