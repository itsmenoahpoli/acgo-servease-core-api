import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { Kyc } from '@/entities/kyc.entity';
import { User } from '@/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kyc, User])],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
