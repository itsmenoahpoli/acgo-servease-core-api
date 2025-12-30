import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { KycService } from './kyc.service';
import { Kyc } from '@/entities/kyc.entity';
import { User } from '@/entities/user.entity';
import { AccountType } from '@/common/enums/account-type.enum';
import { KycStatus } from '@/common/enums/kyc-status.enum';

describe('KycService', () => {
  let service: KycService;
  let kycRepository: Repository<Kyc>;
  let userRepository: Repository<User>;

  const mockKycRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycService,
        {
          provide: getRepositoryToken(Kyc),
          useValue: mockKycRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<KycService>(KycService);
    kycRepository = module.get<Repository<Kyc>>(getRepositoryToken(Kyc));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submitKYC', () => {
    it('should submit KYC for service provider', async () => {
      const userId = 'user-id';
      const user = {
        id: userId,
        accountType: AccountType.SERVICE_PROVIDER_INDEPENDENT,
      };
      const kycData = {
        documentType: 'government_id',
        documentUrl: 'https://example.com/doc.pdf',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockKycRepository.create.mockReturnValue({
        userId,
        ...kycData,
        status: KycStatus.PENDING,
      });
      mockKycRepository.save.mockResolvedValue({
        id: 'kyc-id',
        ...kycData,
        status: KycStatus.PENDING,
      });

      const result = await service.submitKYC(
        userId,
        kycData.documentType,
        kycData.documentUrl,
      );

      expect(mockKycRepository.create).toHaveBeenCalled();
      expect(mockKycRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('status', KycStatus.PENDING);
    });

    it('should throw ForbiddenException for non-service provider', async () => {
      const user = {
        id: 'user-id',
        accountType: AccountType.CUSTOMER,
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(
        service.submitKYC('user-id', 'government_id', 'https://example.com/doc.pdf'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.submitKYC('user-id', 'government_id', 'https://example.com/doc.pdf'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getKYCStatus', () => {
    it('should return KYC status for user', async () => {
      const userId = 'user-id';
      const kycs = [
        {
          id: 'kyc-1',
          userId,
          status: KycStatus.PENDING,
        },
      ];

      mockKycRepository.find.mockResolvedValue(kycs);

      const result = await service.getKYCStatus(userId);

      expect(mockKycRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(kycs);
    });
  });
});
