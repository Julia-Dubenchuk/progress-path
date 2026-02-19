import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, Permission])],
  controllers: [RolesController],
  providers: [RolesService, RolesGuard],
  exports: [TypeOrmModule],
})
export class RolesModule {}
