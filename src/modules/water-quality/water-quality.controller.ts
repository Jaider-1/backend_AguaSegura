// src/modules/water-quality/water-quality.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WaterQualityService } from './water-quality.service';
import { CreateWaterQualityDto } from './dto/create-water-quality.dto';

@ApiTags('water-quality')
@Controller('water-quality')
export class WaterQualityController {
  constructor(private readonly waterQualityService: WaterQualityService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo registro de calidad de agua' })
  @ApiResponse({ status: 201, description: 'Registro creado exitosamente' })
  async create(@Body() createDto: CreateWaterQualityDto) {
    return {
      success: true,
      data: await this.waterQualityService.create(createDto)
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial de calidad de agua' })
  @ApiResponse({ status: 200, description: 'Lista de registros' })
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return {
      success: true,
      data: await this.waterQualityService.findAll(undefined, start, end, limit)
    };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Obtener el último registro de calidad' })
  @ApiResponse({ status: 200, description: 'Último registro' })
  async getLatest() {
    return {
      success: true,
      data: await this.waterQualityService.getLatest()
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de calidad' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  async getStats() {
    return {
      success: true,
      data: await this.waterQualityService.getStats()
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro por ID' })
  @ApiResponse({ status: 200, description: 'Registro encontrado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.waterQualityService.findOne(id)
    };
  }
}