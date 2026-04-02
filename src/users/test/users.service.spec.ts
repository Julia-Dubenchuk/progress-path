import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoggerModule } from '../../common/logger/logger.module';
import { ActivityLogsService } from '../../activity-logs/activity-logs.service';
import { OwnershipAuthorizationService } from '../../common/authorization/ownership-authorization.service';
import { UserProfile } from '../../user-profiles/entities/user-profile.entity';
import { UserPreference } from '../../user-preferences/entities/user-preference.entity';
import { SubscriptionDetail } from '../../subscription-details/entities/subscription-detail.entity';

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

  const mockOwnershipAuthorizationService = {
    assertCanManageOwnResourceOrThrow: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockProfileRepository = {
    delete: jest.fn(),
  };

  const mockPreferenceRepository = {
    delete: jest.fn(),
  };

  const mockSubscriptionRepository = {
    delete: jest.fn(),
  };

  const mockRelationRemove = jest.fn();
  const mockRelationOf = jest.fn(() => ({ remove: mockRelationRemove }));
  const mockRelation = jest.fn(() => ({ of: mockRelationOf }));
  const mockCreateQueryBuilder = jest.fn(() => ({ relation: mockRelation }));

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      getRepository: jest.fn(),
      createQueryBuilder: mockCreateQueryBuilder,
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockDataSource.createQueryRunner.mockReturnValue(mockQueryRunner);
    mockQueryRunner.manager.getRepository.mockImplementation((entity) => {
      if (entity === User) {
        return mockUserRepository;
      }

      if (entity === UserProfile) {
        return mockProfileRepository;
      }

      if (entity === UserPreference) {
        return mockPreferenceRepository;
      }

      if (entity === SubscriptionDetail) {
        return mockSubscriptionRepository;
      }

      return null;
    });

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
        {
          provide: OwnershipAuthorizationService,
          useValue: mockOwnershipAuthorizationService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('remove', () => {
    it('deletes dependent records before deleting the user', async () => {
      const currentUser = { id: 'current-user-id' } as User;
      const userId = 'target-user-id';
      const userWithRoles = {
        id: userId,
        username: 'target-user',
        roles: [{ id: 'role-1' }, { id: 'role-2' }],
      } as User;

      mockUserRepository.findOne.mockResolvedValue(userWithRoles);
      mockProfileRepository.delete.mockResolvedValue({ affected: 1 });
      mockPreferenceRepository.delete.mockResolvedValue({ affected: 1 });
      mockSubscriptionRepository.delete.mockResolvedValue({ affected: 1 });
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(currentUser, userId);

      expect(
        mockOwnershipAuthorizationService.assertCanManageOwnResourceOrThrow,
      ).toHaveBeenCalledWith({
        currentUser,
        targetUserId: userId,
        action: 'delete user',
        context: UsersService.name,
        forbiddenMessage: 'You are not allowed to delete this user',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['roles'],
      });
      expect(mockRelation).toHaveBeenCalledWith(User, 'roles');
      expect(mockRelationOf).toHaveBeenCalledWith(userId);
      expect(mockRelationRemove).toHaveBeenCalledWith(['role-1', 'role-2']);
      expect(mockProfileRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockPreferenceRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);

      expect(
        mockProfileRepository.delete.mock.invocationCallOrder[0],
      ).toBeLessThan(mockUserRepository.delete.mock.invocationCallOrder[0]);
      expect(
        mockPreferenceRepository.delete.mock.invocationCallOrder[0],
      ).toBeLessThan(mockUserRepository.delete.mock.invocationCallOrder[0]);
      expect(
        mockSubscriptionRepository.delete.mock.invocationCallOrder[0],
      ).toBeLessThan(mockUserRepository.delete.mock.invocationCallOrder[0]);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockActivityLogsService.create).toHaveBeenCalledWith({
        action: 'USER_DELETED',
        description: `User ${userId} deleted`,
        success: true,
      });
      expect(result).toEqual({
        message: `User ${userId} deleted successfully`,
      });
    });

    it('rolls back and throws when the user does not exist', async () => {
      const currentUser = { id: 'current-user-id' } as User;
      const userId = 'missing-user-id';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(currentUser, userId)).rejects.toThrow(
        new NotFoundException(`User with id ${userId} not found`),
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
      expect(mockPreferenceRepository.delete).not.toHaveBeenCalled();
      expect(mockSubscriptionRepository.delete).not.toHaveBeenCalled();
      expect(mockActivityLogsService.create).toHaveBeenCalledWith({
        action: 'USER_DELETE_FAILED',
        description: `User deletion failed for ${userId}: User with id ${userId} not found`,
        success: false,
      });
    });
  });
});
