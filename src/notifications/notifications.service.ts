import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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

  async sendOTP(email: string, otp: string, type: 'signup' | 'signin') {
    const subject =
      type === 'signup'
        ? 'Verify your account - OTP Code'
        : 'Sign in to your account - OTP Code';

    const html = `
      <h2>${subject}</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in ${this.configService.get<number>('OTP_EXPIRY_MINUTES', 5)} minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;

    return this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_USER'),
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

    const html = `
      <h2>${subject}</h2>
      <p>Your KYC verification has been ${status}.</p>
      ${notes ? `<p>Notes: ${notes}</p>` : ''}
      ${status === 'rejected' ? '<p>Please submit a new KYC application.</p>' : ''}
    `;

    return this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_USER'),
      to: email,
      subject,
      html,
    });
  }
}
