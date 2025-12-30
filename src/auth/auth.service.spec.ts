import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@/entities/user.entity';
import { Otp } from '@/entities/otp.entity';
import { RefreshToken } from '@/entities/refresh-token.entity';
import { NotificationsService } from '@/notifications/notifications.service';
import { AccountType } from '@/common/enums/account-type.enum';
import { AccountStatus } from '@/common/enums/account-status.enum';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let otpRepository: Repository<Otp>;
  let jwtService: JwtService;
  let notificationsService: NotificationsService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOtpRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'OTP_EXPIRY_MINUTES') return 5;
      return defaultValue;
    }),
  };

  const mockNotificationsService = {
    sendOTP: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: mockOtpRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    otpRepository = module.get<Repository<Otp>>(getRepositoryToken(Otp));
    jwtService = module.get<JwtService>(JwtService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and send OTP', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const accountType = AccountType.CUSTOMER;

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        email,
        password: 'hashed',
        accountType,
        accountStatus: AccountStatus.ACTIVE,
      });
      mockUserRepository.save.mockResolvedValue({
        id: 'user-id',
        email,
        accountType,
        accountStatus: AccountStatus.ACTIVE,
      });
      mockOtpRepository.create.mockReturnValue({
        userId: 'user-id',
        code: '123456',
        type: 'signup',
        expiresAt: new Date(),
      });
      mockOtpRepository.save.mockResolvedValue({
        id: 'otp-id',
        code: '123456',
      });

      const result = await service.signup(email, password, accountType);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockNotificationsService.sendOTP).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('should throw ConflictException if user already exists', async () => {
      const email = 'existing@example.com';
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.signup(email, 'password', AccountType.CUSTOMER),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verifySignupOTP', () => {
    it('should verify OTP and activate account', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const user = { id: 'user-id', email };
      const otpRecord = {
        id: 'otp-id',
        userId: 'user-id',
        code: otp,
        type: 'signup',
        used: false,
        expiresAt: new Date(Date.now() + 60000),
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockOtpRepository.findOne.mockResolvedValue(otpRecord);
      mockOtpRepository.save.mockResolvedValue({ ...otpRecord, used: true });

      const result = await service.verifySignupOTP(email, otp);

      expect(mockOtpRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('should throw UnauthorizedException for invalid OTP', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'user-id' });
      mockOtpRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifySignupOTP('test@example.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signin', () => {
    it('should send OTP for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = {
        id: 'user-id',
        email,
        password: 'hashed-password',
        role: null,
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(require('argon2'), 'verify').mockResolvedValue(true);
      mockOtpRepository.create.mockReturnValue({
        userId: 'user-id',
        code: '123456',
        type: 'signin',
      });
      mockOtpRepository.save.mockResolvedValue({ id: 'otp-id' });

      const result = await service.signin(email, password);

      expect(mockNotificationsService.sendOTP).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.signin('test@example.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifySigninOTP', () => {
    it('should return access token for valid OTP', async () => {
      const email = 'test@example.com';
      const otp = '123456';
      const user = {
        id: 'user-id',
        email,
        accountType: AccountType.CUSTOMER,
        accountStatus: AccountStatus.ACTIVE,
        role: null,
      };
      const otpRecord = {
        id: 'otp-id',
        userId: 'user-id',
        code: otp,
        type: 'signin',
        used: false,
        expiresAt: new Date(Date.now() + 60000),
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockOtpRepository.findOne.mockResolvedValue(otpRecord);
      mockOtpRepository.save.mockResolvedValue({ ...otpRecord, used: true });
      mockJwtService.sign
        .mockReturnValueOnce('jwt-token')
        .mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.find.mockResolvedValue([]);
      mockRefreshTokenRepository.create.mockReturnValue({
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date(),
      });
      mockRefreshTokenRepository.save.mockResolvedValue({
        id: 'refresh-token-id',
      });
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return undefined;
      });

      const result = await service.verifySigninOTP(email, otp);

      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
