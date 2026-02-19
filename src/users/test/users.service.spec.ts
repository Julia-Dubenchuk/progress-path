import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoggerModule } from '../../common/logger/logger.module';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  const mockActivityLogsService = {
    create: jest.fn(),
    createTransactional: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ActivityLogsService,
          useValue: mockActivityLogsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
