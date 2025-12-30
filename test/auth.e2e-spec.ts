import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AccountType } from '../src/common/enums/account-type.enum';

describe('Auth (e2e)', () => {
  let app: INestApplication;

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

  describe('/auth/signup (POST)', () => {
    it('should create a new user and send OTP', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          accountType: AccountType.CUSTOMER,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          accountType: AccountType.CUSTOMER,
        })
        .expect(400);
    });

    it('should reject weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'short',
          accountType: AccountType.CUSTOMER,
        })
        .expect(400);
    });
  });

  describe('/auth/signin (POST)', () => {
    it('should send OTP for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
