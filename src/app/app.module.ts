import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../users/users.module';
import { MoodsModule } from '../moods/moods.module';
import { ListsModule } from '../lists/lists.module';
import { ItemsModule } from '../items/items.module';
import { CategoriesModule } from '../categories/categories.module';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { UserPreferencesModule } from '../user-preferences/user-preferences.module';
import { SubscriptionDetailsModule } from '../subscription-details/subscription-details.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
    UsersModule,
    MoodsModule,
    ListsModule,
    ItemsModule,
    CategoriesModule,
    UserProfilesModule,
    UserPreferencesModule,
    SubscriptionDetailsModule,
    ActivityLogsModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
