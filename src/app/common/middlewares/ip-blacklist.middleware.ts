import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedIP } from '@/entities/blacklisted-ip.entity';

@Injectable()
export class IPBlacklistMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(BlacklistedIP)
    private blacklistedIPRepository: Repository<BlacklistedIP>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress;

    const isBlacklisted = await this.blacklistedIPRepository.findOne({
      where: { ipAddress: clientIp },
    });

    if (isBlacklisted) {
      throw new ForbiddenException('Access denied from this IP address');
    }

    next();
  }
}
