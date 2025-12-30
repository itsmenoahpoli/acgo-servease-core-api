import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { PaymentStatus } from '@/common/enums/payment-status.enum';

describe('PaymentsController', () => {
  let app: INestApplication;
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockPaymentsService = {
    getPaymentByBookingId: jest.fn(),
    createPaymentIntent: jest.fn(),
    updatePaymentStatus: jest.fn(),
  };

  beforeEach(async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      accountStatus: 'ACTIVE',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .overrideGuard(AccountStatusGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /payments/booking/:bookingId', () => {
    it('should return 200 with payment details', async () => {
      mockPaymentsService.getPaymentByBookingId.mockResolvedValue({
        id: 'payment-id',
        bookingId: 'booking-id',
        amount: 500,
        status: PaymentStatus.PENDING,
      });

      return request(app.getHttpServer())
        .get('/payments/booking/booking-id')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('amount');
        });
    });
  });

  describe('POST /payments/booking/:bookingId/intent', () => {
    it('should return 200 with payment intent', async () => {
      mockPaymentsService.createPaymentIntent.mockResolvedValue({
        paymentIntentId: null,
        amount: 500,
        currency: 'USD',
        bookingId: 'booking-id',
      });

      return request(app.getHttpServer())
        .post('/payments/booking/booking-id/intent')
        .set('Authorization', 'Bearer token')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('amount');
          expect(res.body).toHaveProperty('bookingId');
        });
    });
  });

  describe('PATCH /payments/:id/status', () => {
    it('should return 200 when updating payment status', async () => {
      mockPaymentsService.updatePaymentStatus.mockResolvedValue({
        id: 'payment-id',
        status: PaymentStatus.COMPLETED,
      });

      return request(app.getHttpServer())
        .patch('/payments/payment-id/status')
        .set('Authorization', 'Bearer token')
        .send({
          status: PaymentStatus.COMPLETED,
          transactionId: 'txn-123',
        })
        .expect(200);
    });

    it('should return 400 for invalid status', () => {
      return request(app.getHttpServer())
        .patch('/payments/payment-id/status')
        .set('Authorization', 'Bearer token')
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });
  });
});
