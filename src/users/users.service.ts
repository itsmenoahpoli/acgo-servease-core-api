import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { AccountStatus } from '@/common/enums/account-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions', 'tenant', 'city'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions', 'tenant', 'city'],
    });
  }

  async updateStatus(userId: string, status: AccountStatus) {
    const user = await this.findById(userId);
    user.accountStatus = status;
    return this.userRepository.save(user);
  }

  async updateTenant(userId: string, tenantId: string) {
    const user = await this.findById(userId);
    user.tenantId = tenantId;
    return this.userRepository.save(user);
  }

  async updateCity(userId: string, cityId: string) {
    const user = await this.findById(userId);
    user.cityId = cityId;
    return this.userRepository.save(user);
  }
}
