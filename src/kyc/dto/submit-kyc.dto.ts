import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitKycDto {
  @ApiProperty({ example: 'government_id' })
  @IsString()
  documentType: string;

  @ApiProperty({ example: 'https://example.com/document.pdf' })
  @IsUrl()
  documentUrl: string;
}
