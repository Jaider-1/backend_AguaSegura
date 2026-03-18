// src/modules/water-quality/dto/water-quality-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class WaterQualityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fecha_hora: string;

  @ApiProperty({ required: false })
  pH?: number;

  @ApiProperty({ required: false })
  temperatura?: number;

  @ApiProperty({ required: false })
  turbidez?: number;

  @ApiProperty({ required: false })
  conductividad_electrica?: number;

  @ApiProperty({ required: false })
  oxigeno_disuelto?: number;

  @ApiProperty()
  deviceId: string;

  @ApiProperty({ required: false })
  userId?: string;

  // Campos calculados por el backend
  @ApiProperty({ description: 'Índice de Riesgo de Calidad del Agua (0-100)' })
  irca: number;

  @ApiProperty({ enum: ['excelente', 'buena', 'regular', 'mala', 'peligrosa'] })
  qualityLevel: string;

  @ApiProperty({ enum: ['sin riesgo', 'bajo', 'medio', 'alto', 'inviable sanitariamente'] })
  riskLevel: string;

  @ApiProperty({ enum: ['green', 'yellow', 'red'] })
  trafficLight: string;

  @ApiProperty()
  measuredAt: Date;

  @ApiProperty()
  createdAt: Date;
}