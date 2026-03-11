// src/modules/water-quality/water-quality.controller.ts
import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
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
    @Query('limit') limit?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (start && isNaN(start.getTime())) {
      throw new BadRequestException('startDate inválida');
    }
    if (end && isNaN(end.getTime())) {
      throw new BadRequestException('endDate inválida');
    }

    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    if (limit && isNaN(parsedLimit)) {
      throw new BadRequestException('limit inválido');
    }

    return {
      success: true,
      data: await this.waterQualityService.findAll(undefined, start, end, parsedLimit)
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

   @Post('calcular-irca')
  @ApiOperation({ 
    summary: 'Calcula el IRCA según normativa colombiana (Res. 2115/2007)',
    description: 'Evalúa parámetros fisicoquímicos y retorna el índice de riesgo sin almacenar'
  })
  @ApiResponse({ status: 200, description: 'Cálculo de IRCA realizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async calcularIRCA(
    @Body() params: {
      pH?: number;
      turbidez?: number;
      conductividad_electrica?: number;
      oxigeno_disuelto?: number;
      temperatura?: number;
    }
  ) {
    // Validaciones básicas
    if (params.pH !== undefined && (params.pH < 0 || params.pH > 14)) {
      throw new BadRequestException('pH debe estar entre 0 y 14');
    }
    if (params.turbidez !== undefined && params.turbidez < 0) {
      throw new BadRequestException('Turbidez no puede ser negativa');
    }
    if (params.conductividad_electrica !== undefined && params.conductividad_electrica < 0) {
      throw new BadRequestException('Conductividad no puede ser negativa');
    }
    if (params.oxigeno_disuelto !== undefined && params.oxigeno_disuelto < 0) {
      throw new BadRequestException('Oxígeno disuelto no puede ser negativo');
    }

    const resultado = await this.waterQualityService.calculateIRCAOnly(params);
    
    return {
      success: true,
      message: 'IRCA calculado exitosamente',
      data: resultado
    };
  }

  /**
   * Endpoint para calcular IRCA de un registro existente
   */
  @Get(':id/calcular-irca')
  @ApiOperation({ summary: 'Calcula IRCA para un registro existente por ID' })
  @ApiResponse({ status: 200, description: 'IRCA calculado' })
  async calcularIRCAPorId(@Param('id') id: string) {
    const registro = await this.waterQualityService.findOne(id);
    
    const resultado = await this.waterQualityService.calculateIRCAOnly({
      pH: registro.pH,
      turbidez: registro.turbidez,
      conductividad_electrica: registro.conductividadElectrica,
      oxigeno_disuelto: registro.oxigenoDisuelto,
      temperatura: registro.temperatura
    });

    return {
      success: true,
      data: {
        registro_id: id,
        ...resultado
      }
    };
  }
}