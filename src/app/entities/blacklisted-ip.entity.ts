import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('blacklisted_ips')
export class BlacklistedIP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ipAddress: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;
}
