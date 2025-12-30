import { IsString, IsIP, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlacklistIPDto {
  @ApiProperty({ example: '192.168.1.1' })
  @IsIP()
  ipAddress: string;

  @ApiProperty({ example: 'Suspicious activity', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
