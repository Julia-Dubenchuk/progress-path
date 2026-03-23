import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';
import { Role } from '../entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { LoggerService } from '../../common/logger/logger.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useValue: {} },
        { provide: getRepositoryToken(Permission), useValue: {} },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    });

    moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) });
    moduleBuilder
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
