import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { User } from '@/entities/user.entity';
import { Otp } from '@/entities/otp.entity';
import { RefreshToken } from '@/entities/refresh-token.entity';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp, RefreshToken]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is required');
        }
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1d');
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        } as any;
      },
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
