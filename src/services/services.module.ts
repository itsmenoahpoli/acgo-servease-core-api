import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from '@/entities/service.entity';
import { ServiceCategory } from '@/entities/service-category.entity';
import { User } from '@/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceCategory, User])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
