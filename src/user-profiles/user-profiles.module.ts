import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { UserProfile } from './entities/user-profile.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile]), AuthorizationModule],
  controllers: [UserProfilesController],
  providers: [UserProfilesService],
  exports: [TypeOrmModule],
})
export class UserProfilesModule {}
