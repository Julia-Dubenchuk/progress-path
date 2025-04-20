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
  ) {}

  async register(user: Auth0User) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email: user.email }, { googleId: user.id }],
    });

    if (existingUser) {
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

    return this.login(newUser);
  }

  async registerWithCredentials(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      });

      if (existingUser) {
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
        throw new InternalServerErrorException(
          'User was not created successfully',
        );
      }

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

      console.error('Registration error details:', {
        message: errorMessage,
        stack: errorStack,
        code: errorCode,
        detail: errorDetail,
        hint: errorHint,
      });

      throw new InternalServerErrorException(
        `Failed to register user: ${errorMessage}`,
      );
    }
  }

  async loginWithCredentials(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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
}
