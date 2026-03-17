// src/modules/water-quality/dto/csv-upload-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class FailedRecordDto {
  @ApiProperty()
  row: number;

  @ApiProperty()
  data: any;

  @ApiProperty()
  error: string;
}

export class CsvUploadResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  total_records: number;

  @ApiProperty()
  processed: number;

  @ApiProperty()
  failed: number;

  @ApiProperty({ type: [FailedRecordDto], required: false })
  failed_records?: FailedRecordDto[];
}