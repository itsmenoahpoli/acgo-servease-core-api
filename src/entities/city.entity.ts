import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';
import { Booking } from './booking.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  region: string;

  @OneToMany(() => User, (user) => user.city)
  users: User[];

  @OneToMany(() => Service, (service) => service.city)
  services: Service[];

  @OneToMany(() => Booking, (booking) => booking.city)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
