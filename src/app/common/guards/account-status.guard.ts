import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AccountStatus } from '@/common/enums/account-status.enum';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException(
        `Account is ${user.accountStatus}. Please contact support.`,
      );
    }

    return true;
  }
}
