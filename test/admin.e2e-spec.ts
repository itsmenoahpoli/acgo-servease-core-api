import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AccountStatus } from '../src/app/common/enums/account-status.enum';

describe('Admin (e2e)', () => {
  let app: INestApplication;
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

  describe('/admin/users (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/admin/users').expect(401);
    });

    it('should require admin permissions', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('/admin/users/:id/status (PATCH)', () => {
    it('should update user status', () => {
      return request(app.getHttpServer())
        .patch('/admin/users/user-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: AccountStatus.SUSPENDED,
        })
        .expect(200);
    });
  });

  describe('/admin/kyc/:id/approve (PATCH)', () => {
    it('should approve KYC', () => {
      return request(app.getHttpServer())
        .patch('/admin/kyc/kyc-id/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          notes: 'Approved',
        })
        .expect(200);
    });
  });

  describe('/admin/blacklist/ip (POST)', () => {
    it('should blacklist IP address', () => {
      return request(app.getHttpServer())
        .post('/admin/blacklist/ip')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ipAddress: '192.168.1.1',
          reason: 'Suspicious activity',
        })
        .expect(201);
    });
  });
});
