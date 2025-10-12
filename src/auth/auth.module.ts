import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth0Strategy } from './auth0.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import { SubscriptionDetail } from '../subscription-details/entities/subscription-detail.entity';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { PoliciesGuard } from './guards/policies.guard';
import { CaslAbilityFactory } from './casl/casl-ability.factory';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailerService } from '../common/mailer/mailer.service';
import { MailerModule } from '../common/mailer/mailer.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { ActivityLog } from '../activity-logs/entities/activity-log.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    ConfigModule,
    MailerModule,
    UsersModule,
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserPreference,
      SubscriptionDetail,
      PasswordResetToken,
      ActivityLog,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    Auth0Strategy,
    AuthService,
    RolesGuard,
    PermissionsGuard,
    PoliciesGuard,
    CaslAbilityFactory,
    MailerService,
    UsersService,
    ActivityLogsService,
  ],
  exports: [
    AuthService,
    RolesGuard,
    PermissionsGuard,
    PoliciesGuard,
    CaslAbilityFactory,
    TypeOrmModule,
  ],
})
export class AuthModule {}
