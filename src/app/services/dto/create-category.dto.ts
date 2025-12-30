import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Plumbing' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Plumbing services', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
