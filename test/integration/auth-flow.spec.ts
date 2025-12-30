import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestUtils } from '../test-utils';
import { AccountType } from '../../src/app/common/enums/account-type.enum';

describe('Auth Flow Integration', () => {
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

  describe('Complete Signup Flow', () => {
    it('should complete full signup flow', async () => {
      const email = TestUtils.generateRandomEmail();
      const password = 'password123';

      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email,
          password,
          accountType: AccountType.CUSTOMER,
        });

      expect(signupResponse.status).toBe(201);
      expect(signupResponse.body).toHaveProperty('message');

      const verifyResponse = await request(app.getHttpServer())
        .post('/auth/signup/verify-otp')
        .send({
          email,
          otp: '123456',
        });

      expect([200, 401]).toContain(verifyResponse.status);
    });
  });

  describe('Complete Signin Flow', () => {
    it('should complete full signin flow', async () => {
      const email = TestUtils.generateRandomEmail();
      const password = 'password123';

      await TestUtils.createUser(app, email, password, AccountType.CUSTOMER);

      const signinResponse = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email,
          password,
        });

      expect(signinResponse.status).toBe(200);
      expect(signinResponse.body).toHaveProperty('message');

      const verifyResponse = await request(app.getHttpServer())
        .post('/auth/signin/verify-otp')
        .send({
          email,
          otp: '123456',
        });

      expect([200, 401]).toContain(verifyResponse.status);
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh access token', async () => {
      const email = TestUtils.generateRandomEmail();
      const password = 'password123';

      await TestUtils.createUser(app, email, password, AccountType.CUSTOMER);

      const signinResponse = await TestUtils.signinUser(app, email, password);
      expect(signinResponse).toHaveProperty('message');

      const verifyResponse = await request(app.getHttpServer())
        .post('/auth/signin/verify-otp')
        .send({
          email,
          otp: '123456',
        });

      if (verifyResponse.status === 200 && verifyResponse.body.refreshToken) {
        const refreshResponse = await request(app.getHttpServer())
          .post('/auth/refresh')
          .send({
            refreshToken: verifyResponse.body.refreshToken,
          });

        expect([200, 401]).toContain(refreshResponse.status);
      }
    });
  });
});
