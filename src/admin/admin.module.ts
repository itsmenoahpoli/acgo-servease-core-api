import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '@/entities/user.entity';
import { Role } from '@/entities/role.entity';
import { Permission } from '@/entities/permission.entity';
import { Kyc } from '@/entities/kyc.entity';
import { BlacklistedIP } from '@/entities/blacklisted-ip.entity';
import { BlockedEmail } from '@/entities/blocked-email.entity';
import { Booking } from '@/entities/booking.entity';
import { Tenant } from '@/entities/tenant.entity';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      Kyc,
      BlacklistedIP,
      BlockedEmail,
      Booking,
      Tenant,
    ]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
