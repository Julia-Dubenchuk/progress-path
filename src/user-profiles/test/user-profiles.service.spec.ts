import { Test, TestingModule } from '@nestjs/testing';
import { UserProfilesService } from '../user-profiles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { LoggerModule } from '../../common/logger/logger.module';
import { OwnershipAuthorizationService } from '../../common/authorization/ownership-authorization.service';

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

  const mockOwnershipAuthorizationService = {
    assertCanManageOwnResourceOrThrow: jest.fn(),
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
        {
          provide: OwnershipAuthorizationService,
          useValue: mockOwnershipAuthorizationService,
        },
      ],
    }).compile();

    service = module.get<UserProfilesService>(UserProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
