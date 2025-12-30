import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import {
  generateOTPEmail,
  generateKYCNotificationEmail,
} from './email-templates';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private getLogoUrl(): string {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    return `${appUrl}/public/brand-logo.jpeg`;
  }

  private getFromAddress(): string {
    return 'Servease <no-reply.system@servease.com>';
  }

  async sendOTP(email: string, otp: string, type: 'signup' | 'signin', userName?: string) {
    const subject =
      type === 'signup'
        ? 'Verify your account - OTP Code'
        : 'Sign in to your account - OTP Code';

    const expiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES', 5);
    const html = generateOTPEmail(otp, type, expiryMinutes, userName, this.getLogoUrl());

    return this.transporter.sendMail({
      from: this.getFromAddress(),
      to: email,
      subject,
      html,
    });
  }

  async sendKYCNotification(
    email: string,
    status: 'approved' | 'rejected',
    notes?: string,
  ) {
    const subject =
      status === 'approved'
        ? 'KYC Verification Approved'
        : 'KYC Verification Rejected';

    const html = generateKYCNotificationEmail(status, notes, this.getLogoUrl());

    return this.transporter.sendMail({
      from: this.getFromAddress(),
      to: email,
      subject,
      html,
    });
  }
}
