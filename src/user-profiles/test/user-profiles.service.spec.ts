import { Test, TestingModule } from '@nestjs/testing';
import { UserProfilesService } from '../user-profiles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { LoggerModule } from '../../common/logger/logger.module';

describe('UserProfilesService', () => {
  let service: UserProfilesService;

  const mockUserProfileRepository = {
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
        UserProfilesService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockUserProfileRepository,
        },
      ],
    }).compile();

    service = module.get<UserProfilesService>(UserProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
