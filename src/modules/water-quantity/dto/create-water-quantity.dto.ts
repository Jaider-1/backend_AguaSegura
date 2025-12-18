// src/modules/water-quantity/dto/create-water-quantity.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWaterQuantityDto {
  @ApiProperty({ example: 450.0 })
  @IsNumber()
  @Type(() => Number)
  volume: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Type(() => Number)
  flowRate: number;

  @ApiProperty({ example: 65.5 })
  @IsNumber()
  @Type(() => Number)
  level: number;

  @ApiProperty({ example: 3.2 })
  @IsNumber()
  @Type(() => Number)
  pressure: number;

  @ApiProperty({ example: 'Tanque principal', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 'sensor-cantidad-001', required: false })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiProperty({ example: 'user-id-uuid', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}