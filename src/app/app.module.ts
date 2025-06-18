import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { HealthModule } from './health/health.module';
import settings from '../config/settings';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    JwtModule.register({
      secret: settings.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
      }),
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
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
