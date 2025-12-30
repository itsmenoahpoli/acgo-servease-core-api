import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AccountType } from '@/common/enums/account-type.enum';
import { AccountStatus } from '@/common/enums/account-status.enum';
import { Role } from './role.entity';
import { Otp } from './otp.entity';
import { Kyc } from './kyc.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';
import { Tenant } from './tenant.entity';
import { City } from './city.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  accountType: AccountType;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PENDING,
  })
  accountStatus: AccountStatus;

  @Column({ nullable: true })
  roleId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  cityId: string;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'cityId' })
  city: City;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @OneToMany(() => Kyc, (kyc) => kyc.user)
  kycs: Kyc[];

  @OneToMany(() => Service, (service) => service.provider)
  services: Service[];

  @OneToMany(() => Booking, (booking) => booking.customer)
  customerBookings: Booking[];

  @OneToMany(() => Booking, (booking) => booking.provider)
  providerBookings: Booking[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
