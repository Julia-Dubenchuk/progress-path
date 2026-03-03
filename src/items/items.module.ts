import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { ItemsAdminController } from './controllers/items-admin.controller';
import { Item } from './entities/item.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, User]), AuthModule],
  controllers: [ItemsController, ItemsAdminController],
  providers: [ItemsService, RolesGuard],
})
export class ItemsModule {}
