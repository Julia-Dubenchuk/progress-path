import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Action } from '../../permissions/entities/permission.entity';

interface RequestWithUser {
  user: {
    sub: string;
    [key: string]: any;
  };
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Action[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required, access granted
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.sub;

    if (!userId) {
      return false; // No user ID in the request, access denied
    }

    // Find the user with their roles and the roles' permissions
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || !user.roles || user.roles.length === 0) {
      return false; // User not found or has no roles, access denied
    }

    // Collect all permissions from all roles
    const userPermissions = new Set<string>();

    user.roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((permission) => {
          userPermissions.add(permission.action);
        });
      }
    });

    // Check if the user has any of the required permissions
    return requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );
  }
}
