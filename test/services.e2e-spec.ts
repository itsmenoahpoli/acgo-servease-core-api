import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AccountType } from '../src/common/enums/account-type.enum';

describe('Services (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let adminToken: string;

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

  describe('/services/categories (GET)', () => {
    it('should return service categories', () => {
      return request(app.getHttpServer())
        .get('/services/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/services (GET)', () => {
    it('should return services list', () => {
      return request(app.getHttpServer())
        .get('/services')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter services by category', () => {
      return request(app.getHttpServer())
        .get('/services?category=Plumbing')
        .expect(200);
    });

    it('should filter services by price range', () => {
      return request(app.getHttpServer())
        .get('/services?minPrice=100&maxPrice=1000')
        .expect(200);
    });
  });

  describe('/services (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/services')
        .send({
          title: 'Test Service',
          categoryId: 'category-id',
          price: 100,
        })
        .expect(401);
    });
  });
});
