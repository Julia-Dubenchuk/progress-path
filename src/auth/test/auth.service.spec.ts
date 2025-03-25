import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { UserProfile } from '../../user-profiles/entities/user-profile.entity';
import { UserPreference } from '../../user-preferences/entities/user-preference.entity';
import { SubscriptionDetail } from '../../subscription-details/entities/subscription-detail.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Auth0User } from '../types';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  const mockUserProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserPreferenceRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSubscriptionDetailRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockUserProfileRepository,
        },
        {
          provide: getRepositoryToken(UserPreference),
          useValue: mockUserPreferenceRepository,
        },
        {
          provide: getRepositoryToken(SubscriptionDetail),
          useValue: mockSubscriptionDetailRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('registerWithCredentials', () => {
    const mockRegisterDto: RegisterDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      mockUserRepository.manager.transaction.mockImplementation(
        async (callback: (manager: any) => Promise<void>) => {
          await callback({
            create: jest.fn().mockReturnValue({
              id: 'test-id',
            }),
            save: jest.fn().mockResolvedValue(true),
          });
          return true;
        },
      );

      mockUserRepository.findOne.mockResolvedValueOnce({
        id: 'test-id',
        email: mockRegisterDto.email,
        username: mockRegisterDto.username,
        firstName: mockRegisterDto.firstName,
        lastName: mockRegisterDto.lastName,
      });

      const result = await service.registerWithCredentials(mockRegisterDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toMatchObject({
        email: mockRegisterDto.email,
        username: mockRegisterDto.username,
        firstName: mockRegisterDto.firstName,
        lastName: mockRegisterDto.lastName,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'existing-id',
        email: mockRegisterDto.email,
      });

      await expect(
        service.registerWithCredentials(mockRegisterDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('loginWithCredentials', () => {
    const mockLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'test-id',
        email: mockLoginDto.email,
        password: '$2b$10$test-hash',
        username: 'testuser',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.loginWithCredentials(mockLoginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toMatchObject({
        email: mockLoginDto.email,
      });
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.loginWithCredentials(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register (Auth0)', () => {
    const mockAuth0User: Auth0User = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      profile: {
        id: 'auth0|123',
        displayName: 'Test User',
        name: {
          givenName: 'Test',
          familyName: 'User',
        },
        emails: [{ value: 'test@example.com' }],
      },
    };

    it('should successfully register a new Auth0 user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: 'test-id',
        email: mockAuth0User.profile.emails[0].value,
        firstName: mockAuth0User.profile.name?.givenName,
        lastName: mockAuth0User.profile.name?.familyName,
      });
      mockUserRepository.save.mockResolvedValue({
        id: 'test-id',
        email: mockAuth0User.profile.emails[0].value,
        firstName: mockAuth0User.profile.name?.givenName,
        lastName: mockAuth0User.profile.name?.familyName,
      });

      const result = await service.register(mockAuth0User);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toMatchObject({
        email: mockAuth0User.profile.emails[0].value,
        firstName: mockAuth0User.profile.name?.givenName,
        lastName: mockAuth0User.profile.name?.familyName,
      });
    });

    it('should throw ConflictException if Auth0 user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'existing-id',
        email: mockAuth0User.profile.emails[0].value,
      });

      await expect(service.register(mockAuth0User)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
