import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Bookings (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/bookings (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/bookings')
        .send({
          serviceId: 'service-id',
          schedule: '2025-12-31T10:00:00Z',
          address: '123 Main St',
        })
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          serviceId: 'service-id',
        })
        .expect(400);
    });
  });

  describe('/bookings (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/bookings').expect(401);
    });
  });

  describe('/bookings/:id (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/bookings/booking-id')
        .expect(401);
    });
  });
});
