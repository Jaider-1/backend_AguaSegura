import { IsNumber, IsOptional, IsISO8601, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWaterDataDto {
    
  @ApiProperty({ 
    example: '2024-01-15T10:30:00Z', 
    description: 'Fecha y hora de medición (ISO 8601)' 
  })
  @IsISO8601()
  fecha_hora: string;

  @ApiProperty({ 
    example: 65.5, 
    description: 'Cantidad porcentual de agua (0-100)' 
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  cantidad_porcentual_agua: number;

  @ApiProperty({ 
    example: 7.2, 
    description: 'pH (0-14)', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  @Type(() => Number)
  ph?: number;

  @ApiProperty({ 
    example: 22.5, 
    description: 'Temperatura en °C', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  temperatura?: number;

  @ApiProperty({ 
    example: 3.5, 
    description: 'Turbidez en NTU', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  turbidez?: number;

  @ApiProperty({ 
    example: 250.0, 
    description: 'Conductividad eléctrica en µS/cm', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  conductividad_electrica?: number;

  @ApiProperty({ 
    example: 8.5, 
    description: 'Oxígeno disuelto en mg/L', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  oxigeno_disuelto?: number;

  @ApiProperty({ 
    example: 'sensor-001', 
    description: 'ID del dispositivo sensor', 
    required: false 
  })
  @IsOptional()
  @IsString()
  device_id?: string;

  @ApiProperty({ 
    example: 'user-id-uuid', 
    description: 'ID del usuario (opcional)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({
    example: "volume: 655.0",
    description: "Volumen de agua calculado en litros",
    required: false,
    })
    volume?: number;
    @ApiProperty({
    example: "flowRate: 32.5",
    description: "Caudal estimado en litros por segundo",
    required: false,
    })
    flowRate?: number;
    @ApiProperty({
    example: "level: 65.5",
    description: "Nivel de agua en porcentaje",
    required: false,
    })
    level?: number;
  
}

export class WaterDataResponseDto {
  success: boolean;
  message: string;
  water_quantity_id?: string;
  water_quality_id?: string;
  recommendation_id?: string;
  data: {
    fecha_hora: string;
    cantidad_porcentual_agua: number;
    ph?: number;
    temperatura?: number;
    turbidez?: number;
    conductividad_electrica?: number;
    oxigeno_disuelto?: number;
    device_id?: string;
  };
}

// DTO para CSV
export class CsvUploadResponseDto {
  success: boolean;
  message: string;
  total_records: number;
  processed: number;
  failed: number;
  failed_records?: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}