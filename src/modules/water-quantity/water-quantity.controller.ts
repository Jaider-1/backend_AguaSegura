// src/modules/water-quantity/water-quantity.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WaterQuantityService } from './water-quantity.service';
import { CreateWaterQuantityDto } from './dto/create-water-quantity.dto';
import { WaterQuantityQueryDto } from './dto/water-quantity-query.dto';

@ApiTags('water-quantity')
@Controller('water-quantity')
export class WaterQuantityController {
  constructor(private readonly waterQuantityService: WaterQuantityService) {}


  @Post('plain')
  @ApiOperation({ summary: 'Crear registro desde datos planos' })
  @ApiResponse({ status: 201, description: 'Registro creado exitosamente desde formato plano' })
  async createFromPlain(
    @Body() plainDto: CreateWaterQuantityDto,
    @Query('userId') userId: string
  ) {
    return {
      success: true,
      message: 'Datos de cantidad recibidos y guardados correctamente',
      data: await this.waterQuantityService.createFromPlainData(plainDto, userId)
    };
  }

  // Endpoint para recepción masiva desde dispositivos IoT
  @Post('device/batch')
  @ApiOperation({ summary: 'Recibir datos en lote desde dispositivo IoT' })
  @ApiResponse({ status: 201, description: 'Datos en lote procesados' })
  async createBatchFromDevice(
    @Body() batchData: CreateWaterQuantityDto[],
    @Query('deviceId') deviceId: string
  ) {
    return this.waterQuantityService.createBatchFromDevice(batchData, deviceId);
  }


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
    @Query() query: WaterQuantityQueryDto,
  ) {
    const start = query.startDate ? new Date(query.startDate) : undefined;
    const end = query.endDate ? new Date(query.endDate) : undefined;
    return {
      success: true,
      data: await this.waterQuantityService.findAllWithFilters(start, end, query.limit)
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