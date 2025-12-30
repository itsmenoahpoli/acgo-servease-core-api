import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '@/entities/service.entity';
import { ServiceCategory } from '@/entities/service-category.entity';
import { User } from '@/entities/user.entity';
import { AccountType } from '@/common/enums/account-type.enum';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createCategory(name: string, description?: string) {
    const category = this.categoryRepository.create({ name, description });
    return this.categoryRepository.save(category);
  }

  async getCategories() {
    return this.categoryRepository.find();
  }

  async createService(
    providerId: string,
    title: string,
    categoryId: string,
    price: number,
    description?: string,
    images?: Array<{
      url: string;
      alt?: string;
      order?: number;
      caption?: string;
    }>,
  ) {
    const provider = await this.userRepository.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (
      provider.accountType !== AccountType.SERVICE_PROVIDER_INDEPENDENT &&
      provider.accountType !== AccountType.SERVICE_PROVIDER_BUSINESS
    ) {
      throw new ForbiddenException('Only service providers can create services');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const service = this.serviceRepository.create({
      title,
      categoryId,
      providerId,
      price,
      description,
      images,
      cityId: provider.cityId,
      isActive: true,
    });

    return this.serviceRepository.save(service);
  }

  async browseServices(
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    cityId?: string,
  ) {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.provider', 'provider')
      .where('service.isActive = :isActive', { isActive: true });

    if (category) {
      query.andWhere('LOWER(category.name) = LOWER(:category)', { category });
    }

    if (minPrice !== undefined) {
      query.andWhere('service.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('service.price <= :maxPrice', { maxPrice });
    }

    if (cityId) {
      query.andWhere('service.cityId = :cityId', { cityId });
    }

    return query.getMany();
  }

  async getServiceById(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['category', 'provider'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }
}
