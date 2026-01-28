// src/modules/water-quality/dto/create-water-quality-plain.dto.ts
import { IsNumber, IsOptional, IsString, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaterQualityDto {
  @ApiProperty({ 
    example: '2024-01-20T14:30:00Z',
    description: 'Fecha y hora de medición (ISO 8601)'
  })
  @IsDateString()
  fecha_hora: string;

  @ApiProperty({ 
    example: 7.2,
    description: 'pH (0-14)',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  pH?: number;

  @ApiProperty({ 
    example: 22.5,
    description: 'Temperatura en °C',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @ApiProperty({ 
    example: 3.5,
    description: 'Turbidez en NTU',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  turbidez?: number;

  @ApiProperty({ 
    example: 850,
    description: 'Conductividad Eléctrica en µS/cm',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  conductividad_electrica?: number;

  @ApiProperty({ 
    example: 8.5,
    description: 'Oxígeno disuelto en mg/L',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oxigeno_disuelto?: number;

  @ApiProperty({ 
    example: 'sensor-calidad-001',
    description: 'ID del dispositivo sensor',
    required: false 
  })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ 
    example: 'user-id-uuid',
    description: 'ID del usuario',
    required: false 
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ 
    example: '2024-01-15T10:30:00Z', 
    description: 'Fecha y hora de medición',
    required: false 
  })
  @IsOptional()
  measuredAt?: Date;
}