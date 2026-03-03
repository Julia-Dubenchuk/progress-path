import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { List } from './entities/list.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([List, User])],
  controllers: [ListsController],
  providers: [ListsService, RolesGuard],
  exports: [TypeOrmModule],
})
export class ListsModule {}
