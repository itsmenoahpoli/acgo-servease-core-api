import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { AccountTypeGuard } from '@/common/guards/account-type.guard';

describe('KycController', () => {
  let app: INestApplication;
  let controller: KycController;
  let service: KycService;

  const mockKycService = {
    submitKYC: jest.fn(),
    getKYCStatus: jest.fn(),
  };

  beforeEach(async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      accountType: 'SERVICE_PROVIDER_INDEPENDENT',
      accountStatus: 'ACTIVE',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KycController],
      providers: [
        {
          provide: KycService,
          useValue: mockKycService,
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
      .overrideGuard(AccountTypeGuard)
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

    controller = module.get<KycController>(KycController);
    service = module.get<KycService>(KycService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /kyc/submit', () => {
    it('should return 201 when KYC is submitted', async () => {
      mockKycService.submitKYC.mockResolvedValue({
        id: 'kyc-id',
        status: 'PENDING',
      });

      return request(app.getHttpServer())
        .post('/kyc/submit')
        .set('Authorization', 'Bearer token')
        .send({
          documentType: 'government_id',
          documentUrl: 'https://example.com/document.pdf',
        })
        .expect(201);
    });

    it('should return 400 for invalid URL', () => {
      return request(app.getHttpServer())
        .post('/kyc/submit')
        .set('Authorization', 'Bearer token')
        .send({
          documentType: 'government_id',
          documentUrl: 'invalid-url',
        })
        .expect(400);
    });
  });

  describe('GET /kyc/status', () => {
    it('should return 200 with KYC status', async () => {
      mockKycService.getKYCStatus.mockResolvedValue([
        {
          id: 'kyc-id',
          status: 'PENDING',
        },
      ]);

      return request(app.getHttpServer())
        .get('/kyc/status')
        .set('Authorization', 'Bearer token')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
