import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '@/entities/role.entity';
import { Permission } from '@/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(name: string, description: string, permissionIds: string[]) {
    if (!permissionIds || permissionIds.length === 0) {
      throw new Error('Permission IDs are required');
    }
    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });

    const role = this.roleRepository.create({
      name,
      description,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async getAll() {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async update(id: string, name: string, permissionIds: string[]) {
    const role = await this.findById(id);
    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });

    role.name = name;
    role.permissions = permissions;

    return this.roleRepository.save(role);
  }
}
