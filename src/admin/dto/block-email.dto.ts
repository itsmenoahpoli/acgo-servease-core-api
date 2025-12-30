import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockEmailDto {
  @ApiProperty({ example: 'spam@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Spam account', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
