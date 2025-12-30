import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '@/entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async findById(id: string): Promise<City> {
    const city = await this.cityRepository.findOne({ where: { id } });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return city;
  }

  async create(name: string, region?: string) {
    const city = this.cityRepository.create({
      name,
      region,
    });

    return this.cityRepository.save(city);
  }

  async getAll() {
    return this.cityRepository.find();
  }

  async findByRegion(region: string) {
    return this.cityRepository.find({ where: { region } });
  }
}
