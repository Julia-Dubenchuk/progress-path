import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { LoggerService } from '../common/logger/logger.service';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly logger: LoggerService,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    try {
      const { roles, ...permissionFields } = createPermissionDto;

      const permission = this.permissionsRepository.create(permissionFields);

      if (roles !== undefined) {
        permission.roles = roles.length
          ? await this.rolesRepository.find({
              where: { id: In(roles) },
            })
          : [];
      }

      const saved = await this.permissionsRepository.save(permission);

      this.logger.log('Permission created successfully', {
        context: PermissionsService.name,
        meta: { id: saved.id, action: saved.action },
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to create permission', {
        context: PermissionsService.name,
        meta: { error },
      });
      throw new InternalServerErrorException('Failed to create permission');
    }
  }

  async findAll(): Promise<Permission[]> {
    this.logger.log('Fetching all permissions', {
      context: PermissionsService.name,
    });

    return this.permissionsRepository.find({
      relations: ['roles'],
    });
  }

  async findOne(id: string): Promise<Permission> {
    this.logger.log(`Fetching permission ${id}`, {
      context: PermissionsService.name,
      meta: { id },
    });

    const permission = await this.permissionsRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      this.logger.warn(`Permission ${id} not found`, {
        context: PermissionsService.name,
        meta: { id },
      });
      throw new NotFoundException(`Permission with id ${id} not found`);
    }

    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    try {
      const permission = await this.findOne(id);

      const { roles, ...permissionFields } = updatePermissionDto;

      const updated = this.permissionsRepository.merge(
        permission,
        permissionFields,
      );

      if (roles !== undefined) {
        updated.roles = roles.length
          ? await this.rolesRepository.find({
              where: { id: In(roles) },
            })
          : [];
      }

      const saved = await this.permissionsRepository.save(updated);

      this.logger.log('Permission updated successfully', {
        context: PermissionsService.name,
        meta: { id: saved.id, action: saved.action },
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to update permission ${id}`, {
        context: PermissionsService.name,
        meta: { error },
      });
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update permission');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.permissionsRepository.delete(id);

    if (result.affected === 0) {
      this.logger.warn(`Permission ${id} not found for deletion`, {
        context: PermissionsService.name,
        meta: { id },
      });
      throw new NotFoundException(`Permission with id ${id} not found`);
    }

    this.logger.log('Permission deleted successfully', {
      context: PermissionsService.name,
      meta: { id },
    });

    return { message: 'Permission successfully deleted!' };
  }
}
