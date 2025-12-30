import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '@/common/enums/account-status.enum';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: AccountStatus })
  @IsEnum(AccountStatus)
  status: AccountStatus;
}
