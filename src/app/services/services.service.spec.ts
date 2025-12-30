import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from '@/entities/service.entity';
import { ServiceCategory } from '@/entities/service-category.entity';
import { User } from '@/entities/user.entity';
import { AccountType } from '@/common/enums/account-type.enum';

describe('ServicesService', () => {
  let service: ServicesService;
  let serviceRepository: Repository<Service>;
  let categoryRepository: Repository<ServiceCategory>;
  let userRepository: Repository<User>;

  const mockServiceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
        {
          provide: getRepositoryToken(ServiceCategory),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    serviceRepository = module.get<Repository<Service>>(getRepositoryToken(Service));
    categoryRepository = module.get<Repository<ServiceCategory>>(
      getRepositoryToken(ServiceCategory),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData = { name: 'Plumbing', description: 'Plumbing services' };

      mockCategoryRepository.create.mockReturnValue(categoryData);
      mockCategoryRepository.save.mockResolvedValue({
        id: 'cat-id',
        ...categoryData,
      });

      const result = await service.createCategory(categoryData.name, categoryData.description);

      expect(mockCategoryRepository.create).toHaveBeenCalled();
      expect(mockCategoryRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('name', categoryData.name);
    });
  });

  describe('createService', () => {
    it('should create a service for valid provider', async () => {
      const providerId = 'provider-id';
      const provider = {
        id: providerId,
        accountType: AccountType.SERVICE_PROVIDER_INDEPENDENT,
      };
      const category = { id: 'cat-id', name: 'Plumbing' };
      const serviceData = {
        title: 'Leak Repair',
        categoryId: 'cat-id',
        price: 500,
        description: 'Fix leaks',
      };

      mockUserRepository.findOne.mockResolvedValue(provider);
      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockServiceRepository.create.mockReturnValue({
        ...serviceData,
        providerId,
      });
      mockServiceRepository.save.mockResolvedValue({
        id: 'service-id',
        ...serviceData,
        providerId,
      });

      const result = await service.createService(
        providerId,
        serviceData.title,
        serviceData.categoryId,
        serviceData.price,
        serviceData.description,
      );

      expect(mockServiceRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('title', serviceData.title);
    });

    it('should throw ForbiddenException for non-provider', async () => {
      const customer = {
        id: 'customer-id',
        accountType: AccountType.CUSTOMER,
      };

      mockUserRepository.findOne.mockResolvedValue(customer);

      await expect(
        service.createService('customer-id', 'Service', 'cat-id', 100),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if category not found', async () => {
      const provider = {
        id: 'provider-id',
        accountType: AccountType.SERVICE_PROVIDER_INDEPENDENT,
      };

      mockUserRepository.findOne.mockResolvedValue(provider);
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createService('provider-id', 'Service', 'invalid-cat', 100),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('browseServices', () => {
    it('should return filtered services', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockServiceRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.browseServices('plumbing', 100, 1000);

      expect(mockServiceRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });
});
