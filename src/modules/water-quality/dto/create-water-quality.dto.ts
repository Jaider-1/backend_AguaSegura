// src/modules/water-quality/dto/create-water-quality.dto.ts
import { IsNumber, IsOptional, IsString, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaterQualityDto {
  @ApiProperty({ example: '2024-01-20T14:30:00Z' })
  @IsDateString()
  fecha_hora: string;

  @ApiProperty({ example: 7.2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  pH?: number;

  @ApiProperty({ example: 22.5, required: false })
  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @ApiProperty({ example: 3.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  turbidez?: number;

  @ApiProperty({ example: 850, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  conductividad_electrica?: number;

  @ApiProperty({ example: 8.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oxigeno_disuelto?: number;

  @ApiProperty({ example: 'user-id', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'device-123', required: true })
  @IsString()
  deviceId: string;
}