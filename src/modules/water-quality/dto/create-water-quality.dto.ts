import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaterQualityDto {
  @ApiProperty({ example: 8.5, description: 'IRCA (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  irca: number;

  @ApiProperty({ example: 7.2, description: 'pH (0-14)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  ph?: number;

  @ApiProperty({ example: 3.5, description: 'Turbidez en NTU', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  turbidity?: number;

  @ApiProperty({ example: 22.5, description: 'Temperatura en °C', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ example: 500.0, description: 'Conductividad en µS/cm', required: false })
  @IsOptional()
  @IsNumber()
  conductivity?: number;

  @ApiProperty({ example: 8.0, description: 'Oxígeno Disuelto en mg/L', required: false })
  @IsOptional()
  @IsNumber()
  dissolvedOxygen?: number;

  @ApiProperty({ 
    example: '2024-01-15T10:30:00Z', 
    description: 'Fecha y hora de medición',
    required: false 
  })
  @IsOptional()
  measuredAt?: Date;
}