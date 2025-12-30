import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kyc } from '@/entities/kyc.entity';
import { User } from '@/entities/user.entity';
import { AccountType } from '@/common/enums/account-type.enum';
import { KycStatus } from '@/common/enums/kyc-status.enum';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async submitKYC(userId: string, documentType: string, documentUrl: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.accountType !== AccountType.SERVICE_PROVIDER_INDEPENDENT &&
      user.accountType !== AccountType.SERVICE_PROVIDER_BUSINESS
    ) {
      throw new ForbiddenException('Only service providers can submit KYC');
    }

    const kyc = this.kycRepository.create({
      userId,
      documentType,
      documentUrl,
      status: KycStatus.PENDING,
    });

    return this.kycRepository.save(kyc);
  }

  async getKYCStatus(userId: string) {
    return this.kycRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
