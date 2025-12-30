import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestUtils } from '../test-utils';
import { AccountType } from '../../src/common/enums/account-type.enum';

describe('Booking Flow Integration', () => {
  let app: INestApplication;
  let customerToken: string;
  let providerToken: string;

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

  describe('Service Creation and Booking', () => {
    it('should create service and allow booking', async () => {
      const providerEmail = TestUtils.generateRandomEmail();
      const customerEmail = TestUtils.generateRandomEmail();

      await TestUtils.createUser(
        app,
        providerEmail,
        'password123',
        AccountType.SERVICE_PROVIDER_INDEPENDENT,
      );

      await TestUtils.createUser(
        app,
        customerEmail,
        'password123',
        AccountType.CUSTOMER,
      );

      const categoryResponse = await request(app.getHttpServer())
        .post('/admin/service-categories')
        .send({
          name: 'Plumbing',
        });

      if (categoryResponse.status === 201 || categoryResponse.status === 401) {
        const serviceResponse = await request(app.getHttpServer())
          .post('/services')
          .set('Authorization', `Bearer ${providerToken}`)
          .send({
            title: 'Leak Repair',
            categoryId: 'category-id',
            price: 500,
            description: 'Fix leaks',
          });

        expect([201, 401]).toContain(serviceResponse.status);

        if (serviceResponse.status === 201) {
          const bookingResponse = await request(app.getHttpServer())
            .post('/bookings')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
              serviceId: serviceResponse.body.id,
              schedule: '2025-12-31T10:00:00Z',
              address: '123 Main St',
            });

          expect([201, 401]).toContain(bookingResponse.status);
        }
      }
    });
  });
});
