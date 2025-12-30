import { IsString, IsArray, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Manager role', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
