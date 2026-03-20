import { IsString, IsOptional, IsEnum, IsObject, IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecommendationDto {
  @ApiProperty({ example: 'Suspender actividades no esenciales que usen agua' })
  @IsString()
  message: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priorityLevel?: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ enum: ['green', 'yellow', 'red'], default: 'yellow' })
  @IsOptional()
  @IsEnum(['green', 'yellow', 'red'])
  trafficLightColor?: 'green' | 'yellow' | 'red';

  @ApiProperty({ example: 'emergencia' })
  @IsString()
  category: string;

  @ApiProperty({ example: { quantityPercentage: 10 }, required: false })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ example: 'user-id-uuid', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'quality-id-uuid', required: false })
  @IsOptional()
  @IsString()
  waterQualityId?: string;

  @ApiProperty({ example: 'quantity-id-uuid', required: false })
  @IsOptional()
  @IsString()
  waterQuantityId?: string;

  @ApiProperty({ example: 4, required: false, description: 'Cantidad de habitantes del hogar' })
  @IsOptional()
  @IsInt()
  @Min(1)
  inhabitants?: number;

  @ApiProperty({ example: 'casa', required: false, description: 'Tipo de vivienda' })
  @IsOptional()
  @IsString()
  housingType?: string;
}
