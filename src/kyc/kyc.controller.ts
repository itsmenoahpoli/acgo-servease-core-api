import {
  Controller,
  Post,
  Body,
  Get,
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
import { KycService } from './kyc.service';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AccountStatusGuard } from '@/common/guards/account-status.guard';
import { AccountTypeGuard } from '@/common/guards/account-type.guard';
import { AccountType } from '@/common/enums/account-type.enum';
import { AccountTypes } from '@/common/decorators/account-type.decorator';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard, AccountStatusGuard)
export class KycController {
  constructor(private kycService: KycService) {}

  @Post('submit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit KYC (Service Providers Only)' })
  @ApiResponse({ status: 201, description: 'KYC submitted successfully' })
  @ApiResponse({ status: 403, description: 'Only service providers can submit KYC' })
  @AccountTypes(
    AccountType.SERVICE_PROVIDER_INDEPENDENT,
    AccountType.SERVICE_PROVIDER_BUSINESS,
  )
  @UseGuards(AccountTypeGuard)
  @ApiBody({ type: SubmitKycDto })
  async submitKYC(@Request() req, @Body() submitKycDto: SubmitKycDto) {
    return this.kycService.submitKYC(
      req.user.id,
      submitKycDto.documentType,
      submitKycDto.documentUrl,
    );
  }

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get KYC Status' })
  @ApiResponse({ status: 200, description: 'KYC status' })
  async getKYCStatus(@Request() req) {
    return this.kycService.getKYCStatus(req.user.id);
  }
}
