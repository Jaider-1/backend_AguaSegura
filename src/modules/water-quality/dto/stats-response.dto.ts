// src/modules/water-quality/dto/stats-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class LevelCountDto {
  @ApiProperty()
  excelente: number;

  @ApiProperty()
  buena: number;

  @ApiProperty()
  regular: number;

  @ApiProperty()
  mala: number;

  @ApiProperty()
  peligrosa: number;
}

class DistributionDto {
  @ApiProperty()
  excelente: number;

  @ApiProperty()
  buena: number;

  @ApiProperty()
  regular: number;

  @ApiProperty()
  mala: number;

  @ApiProperty()
  peligrosa: number;
}

export class StatsResponseDto {
  @ApiProperty()
  average: number;

  @ApiProperty()
  max: number;

  @ApiProperty()
  min: number;

  @ApiProperty()
  totalLecturas: number;

  @ApiProperty()
  byLevel: LevelCountDto;

  @ApiProperty()
  distribution: DistributionDto;
}