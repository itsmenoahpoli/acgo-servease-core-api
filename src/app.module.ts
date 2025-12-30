import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@/auth/auth.module';
import { KycModule } from '@/kyc/kyc.module';
import { AdminModule } from '@/admin/admin.module';
import { ServicesModule } from '@/services/services.module';
import { BookingsModule } from '@/bookings/bookings.module';
import { PaymentsModule } from '@/payments/payments.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { TenantsModule } from '@/tenants/tenants.module';
import { CitiesModule } from '@/cities/cities.module';
import { UsersModule } from '@/users/users.module';
import { RolesModule } from '@/roles/roles.module';
import { PermissionsModule } from '@/permissions/permissions.module';
import { IPBlacklistMiddleware } from '@/common/middlewares/ip-blacklist.middleware';
import { EmailBlockMiddleware } from '@/common/middlewares/email-block.middleware';
import { TenantResolutionMiddleware } from '@/common/middlewares/tenant-resolution.middleware';
import { BlacklistedIP } from '@/entities/blacklisted-ip.entity';
import { BlockedEmail } from '@/entities/blocked-email.entity';
import * as entities from '@/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: Object.values(entities),
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([BlacklistedIP, BlockedEmail]),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    KycModule,
    AdminModule,
    ServicesModule,
    BookingsModule,
    PaymentsModule,
    NotificationsModule,
    TenantsModule,
    CitiesModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        TenantResolutionMiddleware,
        IPBlacklistMiddleware,
        EmailBlockMiddleware,
      )
      .forRoutes('*');
  }
}
