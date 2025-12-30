import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '@/entities/payment.entity';
import { PaymentStatus } from '@/common/enums/payment-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getPaymentByBookingId(bookingId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { bookingId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    paymentIntentId?: string,
    transactionId?: string,
  ) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = status;
    if (paymentIntentId) {
      payment.paymentIntentId = paymentIntentId;
    }
    if (transactionId) {
      payment.transactionId = transactionId;
    }

    return this.paymentRepository.save(payment);
  }

  async createPaymentIntent(bookingId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { bookingId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      paymentIntentId: null,
      amount: payment.amount,
      currency: payment.currency,
      bookingId: payment.bookingId,
    };
  }
}
