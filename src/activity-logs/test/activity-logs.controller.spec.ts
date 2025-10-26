import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogsController } from '../activity-logs.controller';
import { ActivityLogsService } from '../activity-logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityLog } from '../entities/activity-log.entity';
import { LoggerModule } from '../../common/logger/logger.module';

describe('ActivityLogsController', () => {
  let controller: ActivityLogsController;

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
      controllers: [ActivityLogsController],
      providers: [
        ActivityLogsService,
        {
          provide: getRepositoryToken(ActivityLog),
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    controller = module.get<ActivityLogsController>(ActivityLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
