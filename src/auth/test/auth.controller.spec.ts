import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  process.env['auth0__callbackUrl'] = 'http://localhost/callback';

  const mockAuthService = {
    registerWithCredentials: jest.fn(),
    loginWithCredentials: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should successfully register a new user', async () => {
      const expectedResponse = {
        access_token: 'test-token',
        user: {
          id: 'test-id',
          email: registerDto.email,
          username: registerDto.username,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        },
      };

      mockAuthService.registerWithCredentials.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.registerWithCredentials).toHaveBeenCalledWith(
        registerDto,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const expectedResponse = {
        access_token: 'test-token',
        user: {
          id: 'test-id',
          email: loginDto.email,
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      mockAuthService.loginWithCredentials.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.loginWithCredentials).toHaveBeenCalledWith(
        loginDto,
      );
    });
  });
});
