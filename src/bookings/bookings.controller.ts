import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { BookingStatus } from '@/common/enums/booking-status.enum';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, AccountStatusGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Version('1')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiBody({ type: CreateBookingDto })
  async createBookingHandler(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(
      req.user.id,
      createBookingDto.serviceId,
      createBookingDto.schedule,
      createBookingDto.address,
    );
  }

  @Version('1')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiQuery({ name: 'type', enum: ['customer', 'provider'], required: false })
  async getBookingsHandler(
    @Request() req,
    @Query('type') type: 'customer' | 'provider' = 'customer',
  ) {
    return this.bookingsService.getBookings(req.user.id, type);
  }

  @Version('1')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  async getBookingByIdHandler(@Request() req, @Param('id') id: string) {
    return this.bookingsService.getBookingById(id, req.user.id);
  }

  @Version('1')
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  @ApiBody({ type: UpdateBookingStatusDto })
  async updateBookingStatusHandler(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(
      id,
      updateBookingStatusDto.status,
    );
  }
}
