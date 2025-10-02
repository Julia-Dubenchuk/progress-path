import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Auth0User } from './types';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import {
  SubscriptionDetail,
  SubscriptionType,
} from '../subscription-details/entities/subscription-detail.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoggerService } from '../common/logger/logger.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailerService } from '../common/mailer/mailer.service';
import settings from '../config/settings';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserPreference)
    private userPreferenceRepository: Repository<UserPreference>,
    @InjectRepository(SubscriptionDetail)
    private subscriptionDetailRepository: Repository<SubscriptionDetail>,
    private readonly logger: LoggerService,
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepository: Repository<PasswordResetToken>,
    private mailerService: MailerService,
  ) {}

  async register(user: Auth0User) {
    this.logger.log('Registration attempt via OAuth', {
      context: AuthService.name,
      meta: { email: user.email, googleId: user.id },
    });

    const existingUser = await this.userRepository.findOne({
      where: [{ email: user.email }, { googleId: user.id }],
    });

    if (existingUser) {
      this.logger.error('Registration failed: user already exists', {
        context: AuthService.name,
        meta: { email: user.email, googleId: user.id },
      });
      throw new ConflictException('User already exists');
    }

    const newUserId = uuidv4();

    // Create associated entities
    const userProfile = this.userProfileRepository.create({
      id: newUserId,
      profilePicture: user.picture as unknown as Buffer<ArrayBufferLike>,
    });

    const userPreference = this.userPreferenceRepository.create({
      id: newUserId,
    });

    const subscriptionDetail = this.subscriptionDetailRepository.create({
      id: newUserId,
      type: SubscriptionType.FREE,
    });

    // Create new user
    const newUser = this.userRepository.create({
      id: newUserId,
      email: user.email,
      username: user.nickname ?? user.email.split('@')[0],
      firstName: user.firstName,
      lastName: user.lastName,
      googleId: user.id,
    });

    // Save all entities
    await this.userProfileRepository.save(userProfile);
    await this.userPreferenceRepository.save(userPreference);
    await this.subscriptionDetailRepository.save(subscriptionDetail);
    await this.userRepository.save(newUser);

    this.logger.log('Registration successful via OAuth', {
      context: AuthService.name,
      meta: { userId: newUserId, email: user.email },
    });

    return this.login(newUser);
  }

  async registerWithCredentials(registerDto: RegisterDto) {
    this.logger.log('Registration attempt with credentials', {
      context: AuthService.name,
      meta: { email: registerDto.email, username: registerDto.username },
    });

    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      });

      if (existingUser) {
        this.logger.error('Registration failed: user already exists', {
          context: AuthService.name,
          meta: { email: registerDto.email, username: registerDto.username },
        });
        throw new ConflictException('User already exists');
      }

      // Hash password
      const hashedPassword = await hash(registerDto.password, 10);

      // Generate a UUID for all entities
      const entityId = uuidv4();

      // Use a transaction to ensure all operations succeed or fail together
      await this.userRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Create and save subscription detail first
          const subscriptionDetail = transactionalEntityManager.create(
            SubscriptionDetail,
            {
              id: entityId,
              type: SubscriptionType.FREE,
            },
          );
          await transactionalEntityManager.save(subscriptionDetail);

          // Create and save user profile
          const userProfile = transactionalEntityManager.create(UserProfile, {
            id: entityId,
          });
          await transactionalEntityManager.save(userProfile);

          // Create and save user preference
          const userPreference = transactionalEntityManager.create(
            UserPreference,
            {
              id: entityId,
            },
          );
          await transactionalEntityManager.save(userPreference);

          // Create and save user last
          const newUser = transactionalEntityManager.create(User, {
            id: entityId,
            email: registerDto.email,
            username: registerDto.username,
            password: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
          });

          await transactionalEntityManager.save(newUser);
        },
      );

      // After transaction succeeds, get the user and return login response
      const savedUser = await this.userRepository.findOne({
        where: { id: entityId },
      });

      if (!savedUser) {
        this.logger.error(
          'Registration error: user record missing after save',
          {
            context: AuthService.name,
            meta: { email: registerDto.email },
          },
        );
        throw new InternalServerErrorException();
      }

      this.logger.log('Registration successful with credentials', {
        context: AuthService.name,
        meta: { userId: entityId, email: registerDto.email },
      });

      return this.login(savedUser);
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorCode = (error as { code?: string }).code;
      const errorDetail = (error as { detail?: string }).detail;
      const errorHint = (error as { hint?: string }).hint;

      this.logger.error('Registration error details:', {
        meta: {
          message: errorMessage,
          stack: errorStack,
          code: errorCode,
          detail: errorDetail,
          hint: errorHint,
        },
        context: AuthService.name,
      });

      throw new InternalServerErrorException('Failed');
    }
  }

  async loginWithCredentials(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.error('Authentication failed: user not found', {
        context: AuthService.name,
        meta: {
          email: loginDto.email,
        },
      });
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.password) {
      this.logger.error('Authentication failed: no password set for user', {
        context: AuthService.name,
        meta: {
          email: loginDto.email,
          userId: user.id,
        },
      });
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      this.logger.error('Authentication failed: wrong password', {
        context: AuthService.name,
        meta: { email: loginDto.email, userId: user.id },
      });
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.login(user);
  }

  login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async forgotPassword(email: string): Promise<void> {
    this.logger.log(`ForgotPassword requested for email: ${email}`, {
      meta: { email },
    });

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      this.logger.warn(`ForgotPassword: email not registered (${email})`, {
        meta: { email },
      });
      return;
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.tokenRepository.save({
      userId: user.id,
      token,
      expiresAt,
    });

    const resetLink = `http://${settings.HOST}:${settings.PORT}/reset-password?token=${token}`;
    await this.mailerService.sendPasswordReset(user.email, resetLink);

    this.logger.log(
      `ForgotPassword: token generated for userId=${user.id}, email=${user.email}`,
      {
        meta: { userId: user.id, email },
      },
    );
  }
}
