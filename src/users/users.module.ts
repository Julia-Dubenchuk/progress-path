import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';
import { SubscriptionDetailsModule } from '../subscription-details/subscription-details.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    UserProfilesModule,
    UserPreferencesModule,
    SubscriptionDetailsModule,
    ActivityLogsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
