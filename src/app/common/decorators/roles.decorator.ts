import { SetMetadata } from '@nestjs/common';
import { Permission } from '@/common/enums/permission.enum';

export const ROLES_KEY = 'roles';
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(ROLES_KEY, permissions);
