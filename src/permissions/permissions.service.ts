import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '@/entities/permission.entity';
import { Permission as PermissionEnum } from '@/common/enums/permission.enum';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async getAll() {
    return this.permissionRepository.find();
  }

  async findByCode(code: PermissionEnum) {
    return this.permissionRepository.findOne({ where: { name: code } });
  }

  async create(code: PermissionEnum, description?: string) {
    const permission = this.permissionRepository.create({
      name: code,
      description,
    });

    return this.permissionRepository.save(permission);
  }

  async seedPermissions() {
    const permissions = Object.values(PermissionEnum);
    const existing = await this.permissionRepository.find();

    const existingCodes = existing.map((p) => p.name);
    const toCreate = permissions.filter((p) => !existingCodes.includes(p));

    for (const code of toCreate) {
      await this.create(code);
    }

    return this.getAll();
  }
}
