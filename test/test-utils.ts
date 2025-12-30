import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountType } from '../src/app/common/enums/account-type.enum';

export class TestUtils {
  static async createUser(
    app: INestApplication,
    email: string,
    password: string,
    accountType: AccountType,
  ) {
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email,
        password,
        accountType,
      });

    if (signupResponse.status !== 201) {
      throw new Error(`Failed to create user: ${signupResponse.body.message}`);
    }

    return signupResponse.body;
  }

  static async signinUser(
    app: INestApplication,
    email: string,
    password: string,
  ) {
    const signinResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email,
        password,
      });

    if (signinResponse.status !== 200) {
      throw new Error(`Failed to signin: ${signinResponse.body.message}`);
    }

    return signinResponse.body;
  }

  static async verifyOTP(
    app: INestApplication,
    email: string,
    otp: string,
    type: 'signup' | 'signin',
  ) {
    const endpoint =
      type === 'signup' ? '/auth/signup/verify-otp' : '/auth/signin/verify-otp';

    const response = await request(app.getHttpServer())
      .post(endpoint)
      .send({
        email,
        otp,
      });

    return response.body;
  }

  static async getAuthToken(
    app: INestApplication,
    email: string,
    password: string,
  ): Promise<string> {
    await this.signinUser(app, email, password);

    const verifyResponse = await this.verifyOTP(app, email, '123456', 'signin');

    return verifyResponse.accessToken;
  }

  static generateRandomEmail(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  }
}
