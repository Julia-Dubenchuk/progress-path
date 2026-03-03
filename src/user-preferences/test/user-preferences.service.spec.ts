import { Test, TestingModule } from '@nestjs/testing';
import { UserPreferencesService } from '../user-preferences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPreference } from '../entities/user-preference.entity';
import { LoggerModule } from '../../common/logger/logger.module';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  const mockUserPreferenceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        UserPreferencesService,
        {
          provide: getRepositoryToken(UserPreference),
          useValue: mockUserPreferenceRepository,
        },
      ],
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
