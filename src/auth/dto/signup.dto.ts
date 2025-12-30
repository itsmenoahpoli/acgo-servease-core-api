import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@/common/enums/account-type.enum';

export class SignupDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: AccountType,
    example: 'service-provider-independent',
  })
  @IsEnum(AccountType)
  accountType: AccountType;
}
