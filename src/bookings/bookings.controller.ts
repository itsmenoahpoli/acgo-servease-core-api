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

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiBody({ type: CreateBookingDto })
  async createBooking(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(
      req.user.id,
      createBookingDto.serviceId,
      createBookingDto.schedule,
      createBookingDto.address,
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiQuery({ name: 'type', enum: ['customer', 'provider'], required: false })
  async getBookings(
    @Request() req,
    @Query('type') type: 'customer' | 'provider' = 'customer',
  ) {
    return this.bookingsService.getBookings(req.user.id, type);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  async getBookingById(@Request() req, @Param('id') id: string) {
    return this.bookingsService.getBookingById(id, req.user.id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  @ApiBody({ type: UpdateBookingStatusDto })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateBookingStatus(
      id,
      updateBookingStatusDto.status,
    );
  }
}
