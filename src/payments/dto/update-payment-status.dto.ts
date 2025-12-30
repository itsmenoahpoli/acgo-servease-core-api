import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@/common/enums/payment-status.enum';

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  paymentIntentId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;
}
