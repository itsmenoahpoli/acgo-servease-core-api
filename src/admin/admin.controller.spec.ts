import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { AccountStatus } from '@/common/enums/account-status.enum';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { BlacklistIPDto } from './dto/blacklist-ip.dto';

describe('AdminController', () => {
  let app: INestApplication;
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    getUsers: jest.fn(),
    updateUserStatus: jest.fn(),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    approveKYC: jest.fn(),
    rejectKYC: jest.fn(),
    getKYCList: jest.fn(),
    blacklistIP: jest.fn(),
    blockEmail: jest.fn(),
  };

  beforeEach(async () => {
    const mockUser = {
      id: 'admin-id',
      email: 'admin@example.com',
      accountStatus: 'ACTIVE',
      role: {
        permissions: [{ name: 'USER_READ' }, { name: 'USER_WRITE' }],
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
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
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AccountStatusGuard)
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

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /admin/users', () => {
    it('should return 200 with users list', async () => {
      mockAdminService.getUsers.mockResolvedValue([
        { id: 'user-1', email: 'user1@example.com' },
      ]);

      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', 'Bearer admin-token')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('PATCH /admin/users/:id/status', () => {
    it('should return 200 when updating user status', async () => {
      mockAdminService.updateUserStatus.mockResolvedValue({
        id: 'user-id',
        accountStatus: AccountStatus.SUSPENDED,
      });

      return request(app.getHttpServer())
        .patch('/admin/users/user-id/status')
        .set('Authorization', 'Bearer admin-token')
        .send({
          status: AccountStatus.SUSPENDED,
        })
        .expect(200);
    });

    it('should return 400 for invalid status', () => {
      return request(app.getHttpServer())
        .patch('/admin/users/user-id/status')
        .set('Authorization', 'Bearer admin-token')
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });
  });

  describe('POST /admin/roles', () => {
    it('should return 201 when creating role', async () => {
      mockAdminService.createRole.mockResolvedValue({
        id: 'role-id',
        name: 'Manager',
      });

      return request(app.getHttpServer())
        .post('/admin/roles')
        .set('Authorization', 'Bearer admin-token')
        .send({
          name: 'Manager',
          description: 'Manager role',
          permissionIds: [
            '550e8400-e29b-41d4-a716-446655440000',
            '550e8400-e29b-41d4-a716-446655440001',
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });
  });

  describe('PATCH /admin/kyc/:id/approve', () => {
    it('should return 200 when approving KYC', async () => {
      mockAdminService.approveKYC.mockResolvedValue({
        id: 'kyc-id',
        status: 'APPROVED',
      });

      return request(app.getHttpServer())
        .patch('/admin/kyc/kyc-id/approve')
        .set('Authorization', 'Bearer admin-token')
        .send({
          notes: 'Approved',
        })
        .expect(200);
    });
  });

  describe('POST /admin/blacklist/ip', () => {
    it('should return 201 when blacklisting IP', async () => {
      mockAdminService.blacklistIP.mockResolvedValue({
        id: 'blacklist-id',
        ipAddress: '192.168.1.1',
      });

      return request(app.getHttpServer())
        .post('/admin/blacklist/ip')
        .set('Authorization', 'Bearer admin-token')
        .send({
          ipAddress: '192.168.1.1',
          reason: 'Suspicious activity',
        })
        .expect(201);
    });

    it('should return 400 for invalid IP address', () => {
      return request(app.getHttpServer())
        .post('/admin/blacklist/ip')
        .set('Authorization', 'Bearer admin-token')
        .send({
          ipAddress: 'invalid-ip',
          reason: 'Test',
        })
        .expect(400);
    });
  });
});
