import { Module } from '@nestjs/common';
import { OwnershipAuthorizationService } from './ownership-authorization.service';

@Module({
  providers: [OwnershipAuthorizationService],
  exports: [OwnershipAuthorizationService],
})
export class AuthorizationModule {}
