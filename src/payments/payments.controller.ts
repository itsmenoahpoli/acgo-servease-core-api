import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, AccountStatusGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('booking/:bookingId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by booking ID' })
  async getPaymentByBookingId(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getPaymentByBookingId(bookingId);
  }

  @Post('booking/:bookingId/intent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent (Payment gateway ready)' })
  async createPaymentIntent(@Param('bookingId') bookingId: string) {
    return this.paymentsService.createPaymentIntent(bookingId);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment status' })
  @ApiBody({ type: UpdatePaymentStatusDto })
  async updatePaymentStatus(
    @Param('id') paymentId: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updatePaymentStatus(
      paymentId,
      updatePaymentStatusDto.status,
      updatePaymentStatusDto.paymentIntentId,
      updatePaymentStatusDto.transactionId,
    );
  }
}
