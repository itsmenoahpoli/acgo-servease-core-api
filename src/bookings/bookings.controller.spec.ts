import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { BookingStatus } from '@/common/enums/booking-status.enum';

describe('BookingsController', () => {
  let app: INestApplication;
  let controller: BookingsController;
  let service: BookingsService;

  const mockBookingsService = {
    createBooking: jest.fn(),
    getBookings: jest.fn(),
    getBookingById: jest.fn(),
    updateBookingStatus: jest.fn(),
  };

  beforeEach(async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      accountStatus: 'ACTIVE',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
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

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /bookings', () => {
    it('should return 201 when booking is created', async () => {
      mockBookingsService.createBooking.mockResolvedValue({
        id: 'booking-id',
        status: BookingStatus.PENDING,
      });

      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', 'Bearer token')
        .send({
          serviceId: '123e4567-e89b-12d3-a456-426614174000',
          schedule: '2025-12-31T10:00:00Z',
          address: '123 Main St',
        })
        .expect(201);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', 'Bearer token')
        .send({
          serviceId: 'service-id',
        })
        .expect(400);
    });

    it('should return 400 for invalid date format', () => {
      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', 'Bearer token')
        .send({
          serviceId: 'service-id',
          schedule: 'invalid-date',
          address: '123 Main St',
        })
        .expect(400);
    });
  });

  describe('GET /bookings', () => {
    it('should return 200 with bookings list', async () => {
      mockBookingsService.getBookings.mockResolvedValue([
        { id: 'booking-1', status: BookingStatus.PENDING },
      ]);

      return request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter bookings by type', async () => {
      mockBookingsService.getBookings.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/bookings?type=provider')
        .set('Authorization', 'Bearer token')
        .expect(200);
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return 200 with booking details', async () => {
      mockBookingsService.getBookingById.mockResolvedValue({
        id: 'booking-id',
        status: BookingStatus.PENDING,
      });

      return request(app.getHttpServer())
        .get('/bookings/booking-id')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });
  });

  describe('PATCH /bookings/:id/status', () => {
    it('should return 200 when updating booking status', async () => {
      mockBookingsService.updateBookingStatus.mockResolvedValue({
        id: 'booking-id',
        status: BookingStatus.CONFIRMED,
      });

      return request(app.getHttpServer())
        .patch('/bookings/booking-id/status')
        .set('Authorization', 'Bearer token')
        .send({
          status: BookingStatus.CONFIRMED,
        })
        .expect(200);
    });

    it('should return 400 for invalid status', () => {
      return request(app.getHttpServer())
        .patch('/bookings/booking-id/status')
        .set('Authorization', 'Bearer token')
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });
  });
});
