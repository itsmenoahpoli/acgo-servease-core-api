import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('KYC (e2e)', () => {
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

  describe('/kyc/submit (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/kyc/submit')
        .send({
          documentType: 'government_id',
          documentUrl: 'https://example.com/doc.pdf',
        })
        .expect(401);
    });

    it('should validate document URL', () => {
      return request(app.getHttpServer())
        .post('/kyc/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          documentType: 'government_id',
          documentUrl: 'invalid-url',
        })
        .expect(400);
    });
  });

  describe('/kyc/status (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/kyc/status').expect(401);
    });
  });
});
