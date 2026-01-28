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

  @Post('plain')
  @ApiOperation({ summary: 'Crear registro desde datos planos de calidad' })
  @ApiResponse({ status: 201, description: 'Registro de calidad creado desde formato plano' })
  async createFromPlain(
    @Body() plainDto: CreateWaterQualityDto,
    @Query('userId') userId: string
  ) {
    return {
      success: true,
      message: 'Datos de calidad recibidos y guardados correctamente',
      data: await this.waterQualityService.createFromPlainData(plainDto, userId)
    };
  }

  // Endpoint para recepción masiva desde sensores
  @Post('sensor/batch')
  @ApiOperation({ summary: 'Recibir datos en lote desde sensores IoT' })
  @ApiResponse({ status: 201, description: 'Datos de sensores procesados' })
  async createBatchFromSensor(
    @Body() batchData: CreateWaterQualityDto[],
    @Query('deviceId') deviceId: string
  ) {
    const results = [];
    
    for (const data of batchData) {
      // Asignar deviceId si no viene en cada registro
      if (!data.deviceId && deviceId) {
        data.deviceId = deviceId;
      }
      
      try {
        const result = await this.waterQualityService.createFromPlainData(data);
        results.push({ success: true, data: result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ success: false, error: errorMessage });
      }
    }

    return {
      success: true,
      message: `Procesados ${batchData.length} registros de calidad`,
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  // Endpoint simple para IoT (sin autenticación)
  @Post('sensor')
  @ApiOperation({ summary: 'Endpoint simple para sensores IoT' })
  async receiveFromSensor(
    @Body() sensorData: {
      fecha_hora: string;
      pH?: number;
      temperatura?: number;
      turbidez?: number;
      conductividad_electrica?: number;
      oxigeno_disuelto?: number;
      deviceId: string;
    }
  ) {
    // Validar deviceId mínimo
    if (!sensorData.deviceId) {
      return {
        success: false,
        error: 'Se requiere deviceId'
      };
    }

    try {
      const result = await this.waterQualityService.createFromPlainData(sensorData);
      return {
        success: true,
        message: 'Datos recibidos',
        timestamp: new Date().toISOString(),
        data: {
          id: result.id,
          measuredAt: result.measuredAt
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}