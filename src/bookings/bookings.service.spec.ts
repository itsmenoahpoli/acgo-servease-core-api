import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from '@/entities/booking.entity';
import { Service } from '@/entities/service.entity';
import { Payment } from '@/entities/payment.entity';
import { User } from '@/entities/user.entity';
import { BookingStatus } from '@/common/enums/booking-status.enum';
import { PaymentStatus } from '@/common/enums/payment-status.enum';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepository: Repository<Booking>;
  let serviceRepository: Repository<Service>;
  let paymentRepository: Repository<Payment>;

  const mockBookingRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockServiceRepository = {
    findOne: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    serviceRepository = module.get<Repository<Service>>(getRepositoryToken(Service));
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a booking with payment', async () => {
      const customerId = 'customer-id';
      const serviceId = 'service-id';
      const serviceData = {
        id: serviceId,
        providerId: 'provider-id',
        price: 500,
        provider: { id: 'provider-id' },
      };
      const bookingData = {
        serviceId,
        customerId,
        providerId: 'provider-id',
        schedule: new Date(),
        address: '123 Main St',
        status: BookingStatus.PENDING,
      };

      mockServiceRepository.findOne.mockResolvedValue(serviceData);
      mockUserRepository.findOne.mockResolvedValue({
        id: customerId,
        cityId: 'city-id',
      });
      mockBookingRepository.create.mockReturnValue(bookingData);
      mockBookingRepository.save.mockResolvedValue({
        id: 'booking-id',
        ...bookingData,
      });
      mockPaymentRepository.create.mockReturnValue({
        bookingId: 'booking-id',
        amount: 500,
        currency: 'USD',
        status: PaymentStatus.PENDING,
      });
      mockPaymentRepository.save.mockResolvedValue({ id: 'payment-id' });
      mockBookingRepository.findOne.mockResolvedValue({
        id: 'booking-id',
        ...bookingData,
        payment: { id: 'payment-id' },
      });

      const result = await service.createBooking(
        customerId,
        serviceId,
        new Date(),
        '123 Main St',
      );

      expect(mockBookingRepository.save).toHaveBeenCalled();
      expect(mockPaymentRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if service not found', async () => {
      mockServiceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createBooking('customer-id', 'invalid-service', new Date(), 'Address'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBookings', () => {
    it('should return customer bookings', async () => {
      const userId = 'user-id';
      const bookings = [{ id: 'booking-1', customerId: userId }];

      mockBookingRepository.find.mockResolvedValue(bookings);

      const result = await service.getBookings(userId, 'customer');

      expect(mockBookingRepository.find).toHaveBeenCalled();
      expect(result).toEqual(bookings);
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status', async () => {
      const bookingId = 'booking-id';
      const booking = {
        id: bookingId,
        status: BookingStatus.PENDING,
      };

      mockBookingRepository.findOne.mockResolvedValue(booking);
      mockBookingRepository.save.mockResolvedValue({
        ...booking,
        status: BookingStatus.CONFIRMED,
      });

      const result = await service.updateBookingStatus(bookingId, BookingStatus.CONFIRMED);

      expect(mockBookingRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });
  });
});
