import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Tenant } from '@/entities/tenant.entity';

describe('TenantsService', () => {
  let service: TenantsService;
  let repository: Repository<Tenant>;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findBySubdomain', () => {
    it('should find tenant by subdomain', async () => {
      const tenant = {
        id: 'tenant-id',
        name: 'Test Tenant',
        subdomain: 'test',
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(tenant);

      const result = await service.findBySubdomain('test');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { subdomain: 'test', isActive: true },
      });
      expect(result).toEqual(tenant);
    });

    it('should return null if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findBySubdomain('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find tenant by id', async () => {
      const tenant = { id: 'tenant-id', name: 'Test Tenant' };
      mockRepository.findOne.mockResolvedValue(tenant);

      const result = await service.findById('tenant-id');

      expect(result).toEqual(tenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const tenantData = {
        name: 'New Tenant',
        subdomain: 'newtenant',
        isActive: true,
      };

      mockRepository.create.mockReturnValue(tenantData);
      mockRepository.save.mockResolvedValue({
        id: 'tenant-id',
        ...tenantData,
      });

      const result = await service.create('New Tenant', 'newtenant');

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('name', 'New Tenant');
    });
  });
});
