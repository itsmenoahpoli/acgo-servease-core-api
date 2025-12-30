import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '@/auth/auth.service';
import { SignupDto } from '@/auth/dto/signup.dto';
import { VerifyOtpDto } from '@/auth/dto/verify-otp.dto';
import { SigninDto } from '@/auth/dto/signin.dto';
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'User Signup' })
  @ApiResponse({ status: 201, description: 'OTP sent to email' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiBody({ type: SignupDto })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(
      signupDto.email,
      signupDto.password,
      signupDto.accountType,
    );
  }

  @Public()
  @Post('signup/verify-otp')
  @ApiOperation({ summary: 'Verify Signup OTP' })
  @ApiResponse({ status: 200, description: 'Account verified' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiBody({ type: VerifyOtpDto })
  async verifySignupOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifySignupOTP(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
  }

  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'User Signin' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: SigninDto })
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto.email, signinDto.password);
  }

  @Public()
  @Post('signin/verify-otp')
  @ApiOperation({ summary: 'Verify Signin OTP' })
  @ApiResponse({
    status: 200,
    description: 'Returns access token',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  @ApiBody({ type: VerifyOtpDto })
  async verifySigninOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifySigninOTP(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
  })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
  async logout(
    @CurrentUser() user: any,
    @Body() body: { refreshToken?: string },
  ) {
    return this.authService.logout(user.id, body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getProfile(@Request() req) {
    return req.user;
  }
}
