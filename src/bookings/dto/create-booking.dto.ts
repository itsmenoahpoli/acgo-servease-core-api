import { IsUUID, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '2025-02-10T10:00:00Z' })
  @IsDateString()
  schedule: string;

  @ApiProperty({ example: 'Customer address' })
  @IsString()
  address: string;
}
