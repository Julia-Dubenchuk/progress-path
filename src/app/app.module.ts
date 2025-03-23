import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
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
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [],
      synchronize: true,
    }),
    AuthModule,
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
