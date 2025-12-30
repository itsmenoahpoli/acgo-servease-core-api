import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccountType } from '@/common/enums/account-type.enum';

describe('AuthController', () => {
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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should call authService.signup with correct parameters', async () => {
      const signupDto: SignupDto = {
        email: 'test@example.com',
        password: 'password123',
        accountType: AccountType.CUSTOMER,
      };

      mockAuthService.signup.mockResolvedValue({
        message: 'OTP sent to your email',
      });

      const result = await controller.signup(signupDto);

      expect(service.signup).toHaveBeenCalledWith(
        signupDto.email,
        signupDto.password,
        signupDto.accountType,
      );
      expect(result).toEqual({ message: 'OTP sent to your email' });
    });
  });

  describe('verifySignupOTP', () => {
    it('should verify signup OTP', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      mockAuthService.verifySignupOTP.mockResolvedValue({
        message: 'Account verified successfully',
      });

      const result = await controller.verifySignupOTP(verifyOtpDto);

      expect(service.verifySignupOTP).toHaveBeenCalledWith(
        verifyOtpDto.email,
        verifyOtpDto.otp,
      );
      expect(result).toEqual({ message: 'Account verified successfully' });
    });
  });

  describe('signin', () => {
    it('should call authService.signin', async () => {
      const signinDto: SigninDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.signin.mockResolvedValue({
        message: 'OTP sent to your email',
      });

      const result = await controller.signin(signinDto);

      expect(service.signin).toHaveBeenCalledWith(
        signinDto.email,
        signinDto.password,
      );
      expect(result).toEqual({ message: 'OTP sent to your email' });
    });
  });

  describe('verifySigninOTP', () => {
    it('should return access token', async () => {
      const verifyOtpDto: VerifyOtpDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      mockAuthService.verifySigninOTP.mockResolvedValue({
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
      });

      const result = await controller.verifySigninOTP(verifyOtpDto);

      expect(service.verifySigninOTP).toHaveBeenCalledWith(
        verifyOtpDto.email,
        verifyOtpDto.otp,
      );
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await controller.refreshToken(refreshTokenDto);

      expect(service.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const user = { id: 'user-id' };
      const body = { refreshToken: 'refresh-token' };

      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      const result = await controller.logout(user, body);

      expect(service.logout).toHaveBeenCalledWith(user.id, body.refreshToken);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
