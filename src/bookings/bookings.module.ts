import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from '@/entities/booking.entity';
import { Service } from '@/entities/service.entity';
import { Payment } from '@/entities/payment.entity';
import { User } from '@/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Service, Payment, User])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
