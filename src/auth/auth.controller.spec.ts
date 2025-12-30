import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccountType } from '@/common/enums/account-type.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

describe('AuthController', () => {
  let app: INestApplication;
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    verifySignupOTP: jest.fn(),
    signin: jest.fn(),
    verifySigninOTP: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      accountStatus: 'ACTIVE',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
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

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    it('should call authService.signup with correct parameters', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
        accountType: AccountType.CUSTOMER,
      };

      mockAuthService.signup.mockResolvedValue({
        message: 'OTP sent to your email',
      });

      const result = await controller.signupHandler(signupDto);

      expect(service.signup).toHaveBeenCalledWith(
        signupDto.email,
        signupDto.password,
        signupDto.accountType,
      );
      expect(result).toEqual({ message: 'OTP sent to your email' });
    });

    it('should return 201 when signup is successful', async () => {
      mockAuthService.signup.mockResolvedValue({
        message: 'OTP sent to your email',
      });

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

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          accountType: AccountType.CUSTOMER,
        })
        .expect(400);
    });

    it('should return 400 for weak password', () => {
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

  describe('POST /auth/signup/verify-otp', () => {
    it('should verify signup OTP', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      mockAuthService.verifySignupOTP.mockResolvedValue({
        message: 'Account verified successfully',
      });

      const result = await controller.verifySignupOTPHandler(verifyOtpDto);

      expect(service.verifySignupOTP).toHaveBeenCalledWith(
        verifyOtpDto.email,
        verifyOtpDto.otp,
      );
      expect(result).toEqual({ message: 'Account verified successfully' });
    });

    it('should return 200 when OTP is verified', async () => {
      mockAuthService.verifySignupOTP.mockResolvedValue({
        message: 'Account verified successfully',
      });

      return request(app.getHttpServer())
        .post('/auth/signup/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '123456',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 400 for invalid OTP format', () => {
      return request(app.getHttpServer())
        .post('/auth/signup/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '12345',
        })
        .expect(400);
    });
  });

  describe('POST /auth/signin', () => {
    it('should call authService.signin', async () => {
      const signinDto: SigninDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.signin.mockResolvedValue({
        message: 'OTP sent to your email',
      });

      const result = await controller.signinHandler(signinDto);

      expect(service.signin).toHaveBeenCalledWith(
        signinDto.email,
        signinDto.password,
      );
      expect(result).toEqual({ message: 'OTP sent to your email' });
    });

    it('should return 200 when signin is successful', async () => {
      mockAuthService.signin.mockResolvedValue({
        message: 'OTP sent to your email',
      });

      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('POST /auth/signin/verify-otp', () => {
    it('should return access token', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      mockAuthService.verifySigninOTP.mockResolvedValue({
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
      });

      const result = await controller.verifySigninOTPHandler(verifyOtpDto);

      expect(service.verifySigninOTP).toHaveBeenCalledWith(
        verifyOtpDto.email,
        verifyOtpDto.otp,
      );
      expect(result).toHaveProperty('accessToken');
    });

    it('should return 200 with tokens when OTP is verified', async () => {
      mockAuthService.verifySigninOTP.mockResolvedValue({
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
      });

      return request(app.getHttpServer())
        .post('/auth/signin/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '123456',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await controller.refreshTokenHandler(refreshTokenDto);

      expect(service.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should return 200 with new tokens', async () => {
      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'refresh-token',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 400 for missing refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user', async () => {
      const user = { id: 'user-id' };
      const body = { refreshToken: 'refresh-token' };

      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      const result = await controller.logoutHandler(user, body);

      expect(service.logout).toHaveBeenCalledWith(user.id, body.refreshToken);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should return 200 when logout is successful', async () => {
      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .send({
          refreshToken: 'refresh-token',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('GET /auth/profile', () => {
    it('should return 200 with user profile', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        accountType: AccountType.CUSTOMER,
      };

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
    });
  });
});
