import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../../roles/entities/role.entity';

interface RequestWithUser {
  user: {
    sub: string;
    [key: string]: any;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, access granted
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.sub;

    if (!userId) {
      return false; // No user ID in the request, access denied
    }

    // Find the user with their roles
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user || !user.roles || user.roles.length === 0) {
      return false; // User not found or has no roles, access denied
    }

    // Check if the user has any of the required roles
    return user.roles.some((role) => requiredRoles.includes(role.name));
  }
}
