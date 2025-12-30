import { IsString, IsUUID, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ example: 'Leak Repair' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Fix leaking pipes', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
