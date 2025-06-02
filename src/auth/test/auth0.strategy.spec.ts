import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Auth0Strategy } from '../auth0.strategy';

describe('Auth0Strategy', () => {
  let strategy: Auth0Strategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string): string => {
      switch (key) {
        case 'auth0__domain':
          return 'test.auth0.com';
        case 'auth0__clientId':
          return 'test-client-id';
        case 'auth0__clientSecret':
          return 'test-client-secret';
        case 'auth0__callbackUrl':
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

  it('should validate Auth0 profile', async () => {
    const mockProfile = {
      id: 'auth0|123',
      displayName: 'Test User',
      birthday: '',
      _raw: '',
      _json: {
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        picture: null,
        nickname: 'test_user',
      },
      provider: 'Test Auth',
    };

    const result = await strategy.validate(
      {},
      'access-token',
      'refresh-token',
      mockProfile,
    );

    expect(result).toEqual({
      id: mockProfile.id,
      email: mockProfile._json.email,
      firstName: mockProfile._json.given_name,
      lastName: mockProfile._json.family_name,
      nickname: 'test_user',
      picture: null,
    });
  });

  it('should initialize with correct configuration', () => {
    const getSpy = jest.spyOn(configService, 'get');
    expect(getSpy).toHaveBeenCalledWith('auth0__domain');
    expect(getSpy).toHaveBeenCalledWith('auth0__clientId');
    expect(getSpy).toHaveBeenCalledWith('auth0__clientSecret');
    expect(getSpy).toHaveBeenCalledWith('auth0__callbackUrl');
  });
});
