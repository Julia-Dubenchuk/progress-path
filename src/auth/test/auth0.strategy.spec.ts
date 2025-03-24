import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Auth0Strategy } from '../auth0.strategy';

describe('Auth0Strategy', () => {
  let strategy: Auth0Strategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string): string => {
      switch (key) {
        case 'AUTH0_DOMAIN':
          return 'test.auth0.com';
        case 'AUTH0_CLIENT_ID':
          return 'test-client-id';
        case 'AUTH0_CLIENT_SECRET':
          return 'test-client-secret';
        case 'AUTH0_CALLBACK_URL':
          return 'http://localhost:3000/auth/auth0/callback';
        default:
          return '';
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Auth0Strategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<Auth0Strategy>(Auth0Strategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate Auth0 profile', () => {
    const mockProfile = {
      id: 'auth0|123',
      displayName: 'Test User',
      name: {
        givenName: 'Test',
        familyName: 'User',
      },
      emails: [{ value: 'test@example.com' }],
    };

    const result = strategy.validate(
      {},
      'access-token',
      'refresh-token',
      mockProfile,
    );

    expect(result).toEqual({
      id: mockProfile.id,
      email: mockProfile.emails[0].value,
      firstName: mockProfile.name.givenName,
      lastName: mockProfile.name.familyName,
    });
  });

  it('should initialize with correct configuration', () => {
    const getSpy = jest.spyOn(configService, 'get');
    expect(getSpy).toHaveBeenCalledWith('AUTH0_DOMAIN');
    expect(getSpy).toHaveBeenCalledWith('AUTH0_CLIENT_ID');
    expect(getSpy).toHaveBeenCalledWith('AUTH0_CLIENT_SECRET');
    expect(getSpy).toHaveBeenCalledWith('AUTH0_CALLBACK_URL');
  });
});
