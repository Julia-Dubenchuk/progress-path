import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { LoggerService } from '../common/logger/logger.service';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    private readonly logger: LoggerService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const { permissions, ...roleFields } = createRoleDto;

      const role = this.rolesRepository.create(roleFields);

      if (permissions !== undefined) {
        role.permissions = permissions.length
          ? await this.permissionsRepository.find({
              where: { id: In(permissions) },
            })
          : [];
      }

      const saved = await this.rolesRepository.save(role);

      this.logger.log('Role created successfully', {
        context: RolesService.name,
        meta: { id: saved.id, name: saved.name },
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to create role', {
        context: RolesService.name,
        meta: { error },
      });
      throw new InternalServerErrorException('Failed to create role');
    }
  }

  async findAll(): Promise<Role[]> {
    this.logger.log('Fetching all roles', {
      context: RolesService.name,
    });

    return this.rolesRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: string): Promise<Role> {
    this.logger.log(`Fetching role ${id}`, {
      context: RolesService.name,
      meta: { id },
    });

    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      this.logger.warn(`Role ${id} not found`, {
        context: RolesService.name,
        meta: { id },
      });
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      const role = await this.findOne(id);
      const { permissions, ...roleFields } = updateRoleDto;

      const updated = this.rolesRepository.merge(role, roleFields);

      if (permissions !== undefined) {
        updated.permissions = permissions.length
          ? await this.permissionsRepository.find({
              where: { id: In(permissions) },
            })
          : [];
      }

      const saved = await this.rolesRepository.save(updated);

      this.logger.log('Role updated successfully', {
        context: RolesService.name,
        meta: { id: saved.id, name: saved.name },
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to update role ${id}`, {
        context: RolesService.name,
        meta: { error },
      });
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update role');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.rolesRepository.delete(id);

    if (result.affected === 0) {
      this.logger.warn(`Role ${id} not found for deletion`, {
        context: RolesService.name,
        meta: { id },
      });
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    this.logger.log('Role deleted successfully', {
      context: RolesService.name,
      meta: { id },
    });

    return { message: 'Role successfully deleted!' };
  }
}
