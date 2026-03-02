import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, User, Role])],
  controllers: [PermissionsController],
  providers: [PermissionsService, RolesGuard],
  exports: [TypeOrmModule],
})
export class PermissionsModule {}
