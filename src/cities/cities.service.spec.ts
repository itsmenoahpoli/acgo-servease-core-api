import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { City } from '@/entities/city.entity';

describe('CitiesService', () => {
  let service: CitiesService;
  let repository: Repository<City>;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
    repository = module.get<Repository<City>>(getRepositoryToken(City));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find city by id', async () => {
      const city = { id: 'city-id', name: 'Manila', region: 'NCR' };
      mockRepository.findOne.mockResolvedValue(city);

      const result = await service.findById('city-id');

      expect(result).toEqual(city);
    });

    it('should throw NotFoundException if city not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new city', async () => {
      const cityData = {
        name: 'Manila',
        region: 'NCR',
      };

      mockRepository.create.mockReturnValue(cityData);
      mockRepository.save.mockResolvedValue({
        id: 'city-id',
        ...cityData,
      });

      const result = await service.create('Manila', 'NCR');

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('name', 'Manila');
    });
  });

  describe('getAll', () => {
    it('should return all cities', async () => {
      const cities = [
        { id: 'city-1', name: 'Manila' },
        { id: 'city-2', name: 'Cebu' },
      ];

      mockRepository.find.mockResolvedValue(cities);

      const result = await service.getAll();

      expect(result).toEqual(cities);
    });
  });

  describe('findByRegion', () => {
    it('should find cities by region', async () => {
      const cities = [{ id: 'city-1', name: 'Manila', region: 'NCR' }];

      mockRepository.find.mockResolvedValue(cities);

      const result = await service.findByRegion('NCR');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { region: 'NCR' },
      });
      expect(result).toEqual(cities);
    });
  });
});
