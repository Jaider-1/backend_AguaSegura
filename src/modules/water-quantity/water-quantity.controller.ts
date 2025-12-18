// src/modules/water-quantity/water-quantity.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WaterQuantityService } from './water-quantity.service';
import { CreateWaterQuantityDto } from './dto/create-water-quantity.dto';

@ApiTags('water-quantity')
@Controller('water-quantity')
export class WaterQuantityController {
  constructor(private readonly waterQuantityService: WaterQuantityService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo registro de cantidad de agua' })
  @ApiResponse({ status: 201, description: 'Registro creado exitosamente' })
  async create(@Body() createDto: CreateWaterQuantityDto, @Query('userId') userId: string) {
    return {
      success: true,
      data: await this.waterQuantityService.create(createDto, userId)
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial de cantidad de agua' })
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
      data: await this.waterQuantityService.findAllWithFilters(start, end, limit)
    };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Obtener el último registro público' })
  async getLatest() {
    return {
      success: true,
      data: await this.waterQuantityService.getLatest()
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas públicas' })
  async getStats() {
    return {
      success: true,
      data: await this.waterQuantityService.getStats()
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de cantidad de agua por ID' })
  @ApiResponse({ status: 200, description: 'Registro encontrado' })
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.waterQuantityService.findOne(id)
    };
  }
}