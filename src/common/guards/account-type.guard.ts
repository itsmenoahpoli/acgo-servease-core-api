import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountType } from '@/common/enums/account-type.enum';
import { ACCOUNT_TYPE_KEY } from '@/common/decorators/account-type.decorator';

@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAccountTypes =
      this.reflector.getAllAndOverride<AccountType[]>(ACCOUNT_TYPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredAccountTypes || requiredAccountTypes.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!requiredAccountTypes.includes(user.accountType)) {
      throw new ForbiddenException(
        'This action is not allowed for your account type',
      );
    }

    return true;
  }
}
