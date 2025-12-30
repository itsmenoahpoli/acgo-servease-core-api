import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: INestApplication;
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    appController = module.get<AppController>(AppController);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return healthcheck status', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });

  describe('healthcheckHandler', () => {
    it('should return healthcheck', () => {
      expect(appController.healthcheckHandler()).toBeDefined();
    });
  });
});
