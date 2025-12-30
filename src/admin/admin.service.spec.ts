import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { User } from '@/entities/user.entity';
import { Role } from '@/entities/role.entity';
import { Permission } from '@/entities/permission.entity';
import { Kyc } from '@/entities/kyc.entity';
import { BlacklistedIP } from '@/entities/blacklisted-ip.entity';
import { BlockedEmail } from '@/entities/blocked-email.entity';
import { AccountStatus } from '@/common/enums/account-status.enum';
import { KycStatus } from '@/common/enums/kyc-status.enum';
import { NotificationsService } from '@/notifications/notifications.service';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: Repository<User>;
  let kycRepository: Repository<Kyc>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPermissionRepository = {
    findBy: jest.fn(),
  };

  const mockKycRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockBlacklistedIPRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockBlockedEmailRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockNotificationsService = {
    sendKYCNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
        {
          provide: getRepositoryToken(Kyc),
          useValue: mockKycRepository,
        },
        {
          provide: getRepositoryToken(BlacklistedIP),
          useValue: mockBlacklistedIPRepository,
        },
        {
          provide: getRepositoryToken(BlockedEmail),
          useValue: mockBlockedEmailRepository,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    kycRepository = module.get<Repository<Kyc>>(getRepositoryToken(Kyc));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: 'user-1' }, { id: 'user-2' }];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.getUsers();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      const user = { id: 'user-id', accountStatus: AccountStatus.ACTIVE };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({
        ...user,
        accountStatus: AccountStatus.SUSPENDED,
      });

      const result = await service.updateUserStatus(
        'user-id',
        AccountStatus.SUSPENDED,
      );

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.accountStatus).toBe(AccountStatus.SUSPENDED);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserStatus('invalid-id', AccountStatus.SUSPENDED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('approveKYC', () => {
    it('should approve KYC and activate user', async () => {
      const kyc = {
        id: 'kyc-id',
        userId: 'user-id',
        status: KycStatus.PENDING,
        user: {
          id: 'user-id',
          email: 'user@example.com',
          accountStatus: AccountStatus.PENDING,
        },
      };

      mockKycRepository.findOne.mockResolvedValue(kyc);
      mockKycRepository.save.mockResolvedValue({
        ...kyc,
        status: KycStatus.APPROVED,
      });
      mockUserRepository.save.mockResolvedValue({
        ...kyc.user,
        accountStatus: AccountStatus.ACTIVE,
      });

      const result = await service.approveKYC('kyc-id', 'admin-id', 'Approved');

      expect(mockNotificationsService.sendKYCNotification).toHaveBeenCalled();
      expect(result.status).toBe(KycStatus.APPROVED);
    });
  });

  describe('blacklistIP', () => {
    it('should blacklist an IP address', async () => {
      mockBlacklistedIPRepository.findOne.mockResolvedValue(null);
      mockBlacklistedIPRepository.create.mockReturnValue({
        ipAddress: '192.168.1.1',
        reason: 'Suspicious activity',
      });
      mockBlacklistedIPRepository.save.mockResolvedValue({
        id: 'blacklist-id',
        ipAddress: '192.168.1.1',
      });

      const result = await service.blacklistIP('192.168.1.1', 'Suspicious activity');

      expect(mockBlacklistedIPRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('ipAddress', '192.168.1.1');
    });

    it('should throw ForbiddenException if IP already blacklisted', async () => {
      mockBlacklistedIPRepository.findOne.mockResolvedValue({
        id: 'existing-id',
        ipAddress: '192.168.1.1',
      });

      await expect(
        service.blacklistIP('192.168.1.1', 'Reason'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
