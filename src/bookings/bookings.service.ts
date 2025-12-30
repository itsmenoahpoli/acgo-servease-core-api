import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '@/entities/booking.entity';
import { Service } from '@/entities/service.entity';
import { Payment } from '@/entities/payment.entity';
import { User } from '@/entities/user.entity';
import { BookingStatus } from '@/common/enums/booking-status.enum';
import { PaymentStatus } from '@/common/enums/payment-status.enum';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createBooking(
    customerId: string,
    serviceId: string,
    schedule: string | Date,
    address: string,
  ) {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
      relations: ['provider'],
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const customer = await this.userRepository.findOne({
      where: { id: customerId },
    });

    const booking = this.bookingRepository.create({
      serviceId,
      customerId,
      providerId: service.providerId,
      schedule: new Date(schedule),
      address,
      cityId: service.cityId || customer?.cityId,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    const payment = this.paymentRepository.create({
      bookingId: savedBooking.id,
      amount: service.price,
      currency: 'USD',
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    return this.bookingRepository.findOne({
      where: { id: savedBooking.id },
      relations: ['service', 'customer', 'provider', 'payment'],
    });
  }

  async getBookings(userId: string, userType: 'customer' | 'provider') {
    const where =
      userType === 'customer'
        ? { customerId: userId }
        : { providerId: userId };

    return this.bookingRepository.find({
      where,
      relations: ['service', 'customer', 'provider', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBookingById(id: string, userId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['service', 'customer', 'provider', 'payment'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customerId !== userId && booking.providerId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.status = status;
    return this.bookingRepository.save(booking);
  }
}
