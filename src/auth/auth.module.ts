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

@Module({
  imports: [
    PassportModule.register({ session: false }),
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserPreference,
      SubscriptionDetail,
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
