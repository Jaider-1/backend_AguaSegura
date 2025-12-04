import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WaterQuantityService } from './water-quantity.service';
import { CreateWaterQuantityDto } from './dto/create-water-quantity.dto';

@ApiTags('water-quantity')
@Controller('water-quantity')
export class WaterQuantityController {
  constructor(private readonly waterQuantityService: WaterQuantityService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo registro de cantidad de agua' })
  @ApiResponse({ status: 201, description: 'Registro creado exitosamente' })
  async create(@Body() createDto: CreateWaterQuantityDto, @Request() req) {
    const userId = req.user?.userId; // ← Obtener userId del token
    return this.waterQuantityService.create(createDto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener MI historial de cantidad de agua' })
  @ApiResponse({ status: 200, description: 'Lista de registros' })
  async findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.userId; // ← Obtener userId del token
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.waterQuantityService.findAll(userId, start, end, limit);
  }

  // Mantener endpoints públicos para datos generales
  @Get('public/latest')
  @ApiOperation({ summary: 'Obtener el último registro público' })
  async getPublicLatest() {
    return this.waterQuantityService.getLatest(); // Sin userId
  }

  @Get('public/stats')
  @ApiOperation({ summary: 'Obtener estadísticas públicas' })
  async getPublicStats() {
    return this.waterQuantityService.getStats(); // Sin userId
  }
}