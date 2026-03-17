// src/modules/water-quality/dto/water-quality-upload.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CsvUploadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'CSV procesado: 10 exitosos, 2 fallidos' })
  message: string;

  @ApiProperty({ example: 12 })
  total_records: number;

  @ApiProperty({ example: 10 })
  processed: number;

  @ApiProperty({ example: 2 })
  failed: number;

  @ApiProperty({
    required: false,
    example: [{ row: 3, data: { pH: 'abc' }, error: 'Formato inválido' }],
  })
  failed_records?: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}