import { SetMetadata } from '@nestjs/common';
import { Action } from '../../permissions/entities/permission.entity';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Action[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
