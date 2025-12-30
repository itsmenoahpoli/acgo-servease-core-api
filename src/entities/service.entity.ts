import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ServiceCategory } from './service-category.entity';
import { Booking } from './booking.entity';
import { City } from './city.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => ServiceCategory)
  @JoinColumn({ name: 'categoryId' })
  category: ServiceCategory;

  @Column()
  providerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'providerId' })
  provider: User;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  cityId: string;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
