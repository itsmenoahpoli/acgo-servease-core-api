import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { AccountTypeGuard } from '@/common/guards/account-type.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('ServicesController', () => {
  let app: INestApplication;
  let controller: ServicesController;
  let service: ServicesService;

  const mockServicesService = {
    createCategory: jest.fn(),
    getCategories: jest.fn(),
    createService: jest.fn(),
    browseServices: jest.fn(),
    getServiceById: jest.fn(),
  };

  beforeEach(async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      accountType: 'SERVICE_PROVIDER_INDEPENDENT',
      accountStatus: 'ACTIVE',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
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
      .overrideGuard(RolesGuard)
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

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /services/categories', () => {
    it('should return 200 with categories list', async () => {
      mockServicesService.getCategories.mockResolvedValue([
        { id: 'cat-1', name: 'Plumbing' },
      ]);

      return request(app.getHttpServer())
        .get('/services/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /services', () => {
    it('should return 200 with services list', async () => {
      mockServicesService.browseServices.mockResolvedValue([
        { id: 'service-1', title: 'Leak Repair' },
      ]);

      return request(app.getHttpServer())
        .get('/services')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter services by category', async () => {
      mockServicesService.browseServices.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/services?category=Plumbing')
        .expect(200);
    });

    it('should filter services by price range', async () => {
      mockServicesService.browseServices.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/services?minPrice=100&maxPrice=1000')
        .expect(200);
    });
  });

  describe('GET /services/:id', () => {
    it('should return 200 with service details', async () => {
      mockServicesService.getServiceById.mockResolvedValue({
        id: 'service-id',
        title: 'Leak Repair',
        price: 500,
      });

      return request(app.getHttpServer())
        .get('/services/service-id')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title');
        });
    });
  });

  describe('POST /services', () => {
    it('should return 201 when service is created', async () => {
      mockServicesService.createService.mockResolvedValue({
        id: 'service-id',
        title: 'Leak Repair',
        price: 500,
      });

      return request(app.getHttpServer())
        .post('/services')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Leak Repair',
          categoryId: '123e4567-e89b-12d3-a456-426614174000',
          price: 500,
        })
        .expect(201);
    });

    it('should return 400 for invalid price', () => {
      return request(app.getHttpServer())
        .post('/services')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Leak Repair',
          categoryId: 'category-id',
          price: -100,
        })
        .expect(400);
    });
  });
});
