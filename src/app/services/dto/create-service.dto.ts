import { IsString, IsUUID, IsNumber, Min, IsOptional, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ServiceImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  url: string;

  @ApiProperty({ example: 'Service image description', required: false })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: 'Image caption', required: false })
  @IsString()
  @IsOptional()
  caption?: string;
}

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

  @ApiProperty({
    type: [ServiceImageDto],
    example: [
      {
        url: 'https://example.com/image1.jpg',
        alt: 'Main service image',
        order: 1,
        caption: 'Service showcase',
      },
    ],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceImageDto)
  @IsOptional()
  images?: ServiceImageDto[];
}
