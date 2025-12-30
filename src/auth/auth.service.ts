import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { User } from '@/entities/user.entity';
import { Otp } from '@/entities/otp.entity';
import { RefreshToken } from '@/entities/refresh-token.entity';
import { AccountType } from '@/common/enums/account-type.enum';
import { AccountStatus } from '@/common/enums/account-status.enum';
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  private extractNameFromEmail(email: string): string {
    const emailPart = email.split('@')[0];
    return emailPart
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  async signup(email: string, password: string, accountType: AccountType) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await argon2.hash(password);

    const accountStatus =
      accountType === AccountType.CUSTOMER
        ? AccountStatus.ACTIVE
        : AccountStatus.PENDING;

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      accountType,
      accountStatus,
    });

    await this.userRepository.save(user);

    const otp = await this.generateOTP(user.id, 'signup');
    const userName = this.extractNameFromEmail(email);
    await this.notificationsService.sendOTP(email, otp.code, 'signup', userName);

    return { message: 'OTP sent to your email' };
  }

  async verifySignupOTP(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    const otpRecord = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        code: otp,
        type: 'signup',
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    return { message: 'Account verified successfully' };
  }

  async signin(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const otp = await this.generateOTP(user.id, 'signin');
    const userName = user.name || this.extractNameFromEmail(email);
    await this.notificationsService.sendOTP(email, otp.code, 'signin', userName);

    return { message: 'OTP sent to your email' };
  }

  async verifySigninOTP(email: string, otp: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    const otpRecord = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        code: otp,
        type: 'signin',
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async refreshToken(refreshToken: string) {
    const allTokens = await this.refreshTokenRepository.find({
      where: { revoked: false },
      relations: ['user', 'user.role', 'user.role.permissions'],
    });

    let refreshTokenRecord: RefreshToken | null = null;
    for (const token of allTokens) {
      try {
        if (await argon2.verify(token.tokenHash, refreshToken)) {
          refreshTokenRecord = token;
          break;
        }
      } catch {
        continue;
      }
    }

    if (
      !refreshTokenRecord ||
      refreshTokenRecord.revoked ||
      refreshTokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: refreshTokenRecord.userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    refreshTokenRecord.revoked = true;
    await this.refreshTokenRepository.save(refreshTokenRecord);

    return this.generateTokens(user);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const allTokens = await this.refreshTokenRepository.find({
        where: { userId },
      });

      for (const token of allTokens) {
        try {
          if (await argon2.verify(token.tokenHash, refreshToken)) {
            token.revoked = true;
            await this.refreshTokenRepository.save(token);
            break;
          }
        } catch {
          continue;
        }
      }
    } else {
      await this.refreshTokenRepository.update(
        { userId, revoked: false },
        { revoked: true },
      );
    }

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      accountType: user.accountType,
      accountStatus: user.accountStatus,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m') as any,
    });

    const refreshTokenValue = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
    });

    const refreshTokenHash = await argon2.hash(refreshTokenValue);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshTokenRecord = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenRecord);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  private async generateOTP(userId: string, type: string): Promise<Otp> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = this.configService.get<number>(
      'OTP_EXPIRY_MINUTES',
      5,
    );
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    const otp = this.otpRepository.create({
      userId,
      code,
      type,
      expiresAt,
    });

    return this.otpRepository.save(otp);
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
