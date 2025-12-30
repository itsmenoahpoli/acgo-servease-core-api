import { SetMetadata } from '@nestjs/common';
import { AccountType } from '@/common/enums/account-type.enum';

export const ACCOUNT_TYPE_KEY = 'accountType';
export const AccountTypes = (...accountTypes: AccountType[]) =>
  SetMetadata(ACCOUNT_TYPE_KEY, accountTypes);
