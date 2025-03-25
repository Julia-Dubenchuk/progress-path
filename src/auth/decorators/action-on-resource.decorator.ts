import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { Action } from '../../permissions/entities/permission.entity';
import { RoleName } from '../../roles/entities/role.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from './roles.decorator';
import { RequirePermissions } from './permissions.decorator';

export interface ActionOnResourceOptions {
  roles?: RoleName[];
  permissions?: Action[];
  requireAll?: boolean;
}

export const ActionOnResource = (options: ActionOnResourceOptions) => {
  const { roles = [], permissions = [], requireAll = false } = options;

  const decorators = [UseGuards(JwtAuthGuard)];

  if (roles.length > 0) {
    decorators.push(UseGuards(RolesGuard));
    decorators.push(Roles(...roles));
  }

  if (permissions.length > 0) {
    decorators.push(UseGuards(PermissionsGuard));
    decorators.push(RequirePermissions(...permissions));
  }

  if (requireAll) {
    decorators.push(SetMetadata('requireAll', true));
  }

  return applyDecorators(...decorators);
};
