import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaterQuantityDto {
  @ApiProperty({ example: 500.5, description: 'Cantidad en litros' })
  @IsNumber()
  @Min(0)
  liters: number;

  @ApiProperty({ example: 65.5, description: 'Porcentaje de disponibilidad (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;


  // NUEVO CAMPO: userId
  @ApiProperty({ 
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
    description: 'ID del usuario',
    required: false 
  })
  @IsOptional()
  @IsString()
  userId?: string;
}