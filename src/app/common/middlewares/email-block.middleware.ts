import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockedEmail } from '@/entities/blocked-email.entity';

@Injectable()
export class EmailBlockMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(BlockedEmail)
    private blockedEmailRepository: Repository<BlockedEmail>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const email = req.body?.email;

    if (email) {
      const isBlocked = await this.blockedEmailRepository.findOne({
        where: { email },
      });

      if (isBlocked) {
        throw new ForbiddenException('This email address is blocked');
      }
    }

    next();
  }
}
