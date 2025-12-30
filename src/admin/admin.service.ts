import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '@/entities/user.entity';
import { Role } from '@/entities/role.entity';
import { Permission } from '@/entities/permission.entity';
import { Kyc } from '@/entities/kyc.entity';
import { BlacklistedIP } from '@/entities/blacklisted-ip.entity';
import { BlockedEmail } from '@/entities/blocked-email.entity';
import { Booking } from '@/entities/booking.entity';
import { Tenant } from '@/entities/tenant.entity';
import { AccountStatus } from '@/common/enums/account-status.enum';
import { AccountType } from '@/common/enums/account-type.enum';
import { KycStatus } from '@/common/enums/kyc-status.enum';
import { Permission as PermissionEnum } from '@/common/enums/permission.enum';
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    @InjectRepository(BlacklistedIP)
    private blacklistedIPRepository: Repository<BlacklistedIP>,
    @InjectRepository(BlockedEmail)
    private blockedEmailRepository: Repository<BlockedEmail>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private notificationsService: NotificationsService,
  ) {}

  async getUsers() {
    return this.userRepository.find({
      relations: ['role', 'role.permissions'],
    });
  }

  async updateUserStatus(userId: string, status: AccountStatus) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.accountStatus = status;
    return this.userRepository.save(user);
  }

  async createRole(name: string, description?: string, permissionIds?: string[]) {
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

  async updateRole(roleId: string, name: string, permissionIds: string[]) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });

    role.name = name;
    role.permissions = permissions;

    return this.roleRepository.save(role);
  }

  async approveKYC(kycId: string, adminId: string, notes?: string) {
    const kyc = await this.kycRepository.findOne({
      where: { id: kycId },
      relations: ['user'],
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    kyc.status = KycStatus.APPROVED;
    kyc.reviewedBy = adminId;
    if (notes) {
      kyc.reviewNotes = notes;
    }

    await this.kycRepository.save(kyc);

    const user = kyc.user;
    user.accountStatus = AccountStatus.ACTIVE;
    await this.userRepository.save(user);

    await this.notificationsService.sendKYCNotification(
      user.email,
      'approved',
      notes,
    );

    return kyc;
  }

  async rejectKYC(kycId: string, adminId: string, notes?: string) {
    const kyc = await this.kycRepository.findOne({
      where: { id: kycId },
      relations: ['user'],
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    kyc.status = KycStatus.REJECTED;
    kyc.reviewedBy = adminId;
    if (notes) {
      kyc.reviewNotes = notes;
    }

    await this.kycRepository.save(kyc);

    await this.notificationsService.sendKYCNotification(
      kyc.user.email,
      'rejected',
      notes,
    );

    return kyc;
  }

  async blacklistIP(ipAddress: string, reason?: string) {
    const existing = await this.blacklistedIPRepository.findOne({
      where: { ipAddress },
    });

    if (existing) {
      throw new ForbiddenException('IP already blacklisted');
    }

    const blacklistedIP = this.blacklistedIPRepository.create({
      ipAddress,
      reason,
    });

    return this.blacklistedIPRepository.save(blacklistedIP);
  }

  async blockEmail(email: string, reason?: string) {
    const existing = await this.blockedEmailRepository.findOne({
      where: { email },
    });

    if (existing) {
      throw new ForbiddenException('Email already blocked');
    }

    const blockedEmail = this.blockedEmailRepository.create({
      email,
      reason,
    });

    return this.blockedEmailRepository.save(blockedEmail);
  }

  async getKYCList() {
    return this.kycRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDashboardMetrics() {
    const [
      totalUsers,
      activeUsers,
      pendingKyc,
      serviceProviders,
      bookings,
      tenants,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({
        where: { accountStatus: AccountStatus.ACTIVE },
      }),
      this.kycRepository.count({
        where: { status: KycStatus.PENDING },
      }),
      this.userRepository.count({
        where: [
          { accountType: AccountType.SERVICE_PROVIDER_INDEPENDENT },
          { accountType: AccountType.SERVICE_PROVIDER_BUSINESS },
        ],
      }),
      this.bookingRepository.count(),
      this.tenantRepository.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingKyc,
      serviceProviders,
      bookings,
      tenants,
    };
  }
}
