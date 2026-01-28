// src/modules/water-quantity/dto/create-water-quantity-plain.dto.ts
import { IsNumber, IsOptional, IsString, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWaterQuantityDto {
  @ApiProperty({ 
    example: '2024-01-20T14:30:00Z',
    description: 'Fecha y hora de medición (ISO 8601)'
  })
  @IsDateString()
  fecha_hora: string;

  @ApiProperty({ 
    example: 75.5,
    description: 'Cantidad porcentual de agua (0-100%)'
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  cantidad_porcentual_agua: number;

  @ApiProperty({ 
    example: 'sensor-cantidad-001',
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
    example: 'Tanque principal',
    description: 'Ubicación del sensor',
    required: false 
  })
  @IsOptional()
  @IsString()
  location?: string;
}