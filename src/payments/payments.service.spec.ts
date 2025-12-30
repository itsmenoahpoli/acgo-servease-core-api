import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from '@/entities/payment.entity';
import { PaymentStatus } from '@/common/enums/payment-status.enum';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepository: Repository<Payment>;

  const mockPaymentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaymentByBookingId', () => {
    it('should return payment for booking', async () => {
      const payment = {
        id: 'payment-id',
        bookingId: 'booking-id',
        amount: 500,
        status: PaymentStatus.PENDING,
      };

      mockPaymentRepository.findOne.mockResolvedValue(payment);

      const result = await service.getPaymentByBookingId('booking-id');

      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { bookingId: 'booking-id' },
        relations: ['booking'],
      });
      expect(result).toEqual(payment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getPaymentByBookingId('invalid-booking-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const payment = {
        id: 'payment-id',
        status: PaymentStatus.PENDING,
      };

      mockPaymentRepository.findOne.mockResolvedValue(payment);
      mockPaymentRepository.save.mockResolvedValue({
        ...payment,
        status: PaymentStatus.COMPLETED,
        transactionId: 'txn-123',
      });

      const result = await service.updatePaymentStatus(
        'payment-id',
        PaymentStatus.COMPLETED,
        undefined,
        'txn-123',
      );

      expect(mockPaymentRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transactionId).toBe('txn-123');
    });
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent', async () => {
      const payment = {
        id: 'payment-id',
        bookingId: 'booking-id',
        amount: 500,
        currency: 'USD',
      };

      mockPaymentRepository.findOne.mockResolvedValue(payment);

      const result = await service.createPaymentIntent('booking-id');

      expect(result).toHaveProperty('amount', 500);
      expect(result).toHaveProperty('bookingId', 'booking-id');
    });
  });
});
