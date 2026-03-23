import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesController } from '../user-preferences.controller';
import { UserPreferencesService } from '../user-preferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPreference } from '../entities/user-preference.entity';
import { LoggerModule } from '../../common/logger/logger.module';
import { OwnershipAuthorizationService } from '../../common/authorization/ownership-authorization.service';

describe('UserPreferencesController', () => {
  let controller: UserPreferencesController;

  const mockUserPreferenceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockOwnershipAuthorizationService = {
    assertCanManageOwnResourceOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      controllers: [UserPreferencesController],
      providers: [
        UserPreferencesService,
        {
          provide: getRepositoryToken(UserPreference),
          useValue: mockUserPreferenceRepository,
        },
        {
          provide: OwnershipAuthorizationService,
          useValue: mockOwnershipAuthorizationService,
        },
      ],
    }).compile();

    controller = module.get<UserPreferencesController>(
      UserPreferencesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
