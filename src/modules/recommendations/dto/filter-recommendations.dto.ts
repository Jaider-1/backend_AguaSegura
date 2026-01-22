import { IsOptional, IsString, IsBoolean, IsArray, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterRecommendationsDto {
  @ApiProperty({ example: 'user-id-uuid', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: ['critical', 'high', 'medium', 'low'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorityLevels?: string[];

  @ApiProperty({ example: ['green', 'yellow', 'red'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trafficLightColors?: string[];

  @ApiProperty({ example: ['emergencia', 'reuso', 'ahorro', 'calidad'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isApplied?: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}