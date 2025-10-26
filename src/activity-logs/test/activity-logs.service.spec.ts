import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogsService } from '../activity-logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityLog } from '../entities/activity-log.entity';
import { LoggerModule } from '../../common/logger/logger.module';

describe('ActivityLogsService', () => {
  let service: ActivityLogsService;

  const mockActivityLogRepository = {
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
        ActivityLogsService,
        {
          provide: getRepositoryToken(ActivityLog),
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    service = module.get<ActivityLogsService>(ActivityLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
