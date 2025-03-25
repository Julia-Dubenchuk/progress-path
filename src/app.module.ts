import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { SubscriptionDetailsModule } from './subscription-details/subscription-details.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { MoodsModule } from './moods/moods.module';
import { ListsModule } from './lists/lists.module';
import { ItemsModule } from './items/items.module';
import { CategoriesModule } from './categories/categories.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { HealthModule } from './app/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsersModule,
    UserProfilesModule,
    UserPreferencesModule,
    SubscriptionDetailsModule,
    RolesModule,
    PermissionsModule,
    MoodsModule,
    ListsModule,
    ItemsModule,
    CategoriesModule,
    ActivityLogsModule,
    HealthModule,
  ],
})
export class AppModule {}
