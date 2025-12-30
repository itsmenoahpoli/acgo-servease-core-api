import { IsString, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  name: string;

  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
