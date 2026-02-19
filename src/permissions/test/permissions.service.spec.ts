import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionsService } from '../permissions.service';
import { Permission } from '../entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';
import { LoggerService } from '../../common/logger/logger.service';

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(Permission), useValue: {} },
        { provide: getRepositoryToken(Role), useValue: {} },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
