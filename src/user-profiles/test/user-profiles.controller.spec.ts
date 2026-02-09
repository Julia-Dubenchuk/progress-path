import { Test, TestingModule } from '@nestjs/testing';
import { UserProfilesController } from '../user-profiles.controller';
import { UserProfilesService } from '../user-profiles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { LoggerModule } from '../../common/logger/logger.module';

describe('UserProfilesController', () => {
  let controller: UserProfilesController;

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
      controllers: [UserProfilesController],
      providers: [
        UserProfilesService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockUserProfileRepository,
        },
      ],
    }).compile();

    controller = module.get<UserProfilesController>(UserProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
