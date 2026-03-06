import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { RoleName } from '../../roles/entities/role.entity';
import { User } from '../../users/entities/user.entity';

interface AssertOwnershipAccessParams {
  currentUser: User;
  targetUserId: string;
  action: string;
  context: string;
  forbiddenMessage: string;
}

@Injectable()
export class OwnershipAuthorizationService {
  private readonly privilegedRoles: RoleName[] = [RoleName.ADMIN];

  constructor(private readonly logger: LoggerService) {}

  assertCanManageOwnResourceOrThrow({
    currentUser,
    targetUserId,
    action,
    context,
    forbiddenMessage,
  }: AssertOwnershipAccessParams): void {
    const hasPrivilegedRole = currentUser.roles?.some((role) =>
      this.privilegedRoles.includes(role.name),
    );

    if (hasPrivilegedRole || currentUser.id === targetUserId) {
      return;
    }

    this.logger.warn(
      `User ${currentUser.id} tried to ${action} for user ${targetUserId} without permission`,
      {
        context,
        meta: {
          currentUserId: currentUser.id,
          targetUserId,
        },
      },
    );

    throw new ForbiddenException(forbiddenMessage);
  }
}
