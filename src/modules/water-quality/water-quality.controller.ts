// src/modules/water-quality/water-quality.controller.ts
import { Controller, Get, Post, Body, Param, Query, BadRequestException, UploadedFile, UseInterceptors, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { WaterQualityService } from './water-quality.service';
import { CreateWaterQualityDto } from './dto/create-water-quality.dto';
import { CsvUploadResponseDto } from './dto/water-quality-upload.dto';
import { WaterQuality } from './entities/water-quality.entity';

// Transformador para respuestas API - VERSIÓN CORREGIDA
const toWaterDataView = (record: WaterQuality) => {
  // Log para debugging
  console.log('Transformando registro:', {
    id: record.id,
    calidad: record.calidad,
    calidadCategoria: record.calidadCategoria,
    calidadColor: record.calidadColor
  });

  return {
    id: record.id,
    fecha_hora: record.measuredAt,
    // Parámetros crudos
    ph: record.ph,
    temperatura: record.temperature,
    turbidez: record.turbidity,
    conductividad: record.conductivity,
    oxigeno: record.dissolvedOxygen,
    // LO QUE IMPORTANTE PARA EL FRONTEND - VALORES POR DEFECTO
    calidad: record.calidad ?? 0,           // Si es null/undefined, envía 0
    categoria: record.calidadCategoria || 'sin riesgo',
    color: record.calidadColor || 'green',
    // Metadata
    deviceId: record.deviceId,
    userId: record.userId,
    createdAt: record.createdAt
  };
};

@ApiTags('water-quality')
@Controller('water-quality')
export class WaterQualityController {
  constructor(private readonly waterQualityService: WaterQualityService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo registro' })
  @ApiHeader({ name: 'x-user-id', required: false })
  async create(
    @Body() createDto: CreateWaterQualityDto,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const userId = headerUserId || createDto.userId;
    const created = await this.waterQualityService.create(createDto, userId);
    
    return {
      success: true,
      data: toWaterDataView(created),
      message: 'Registro creado exitosamente'
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiHeader({ name: 'x-user-id', required: false })
  async findAll(
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const effectiveUserId = userId || headerUserId;
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    const data = await this.waterQualityService.findAll(
      effectiveUserId, 
      undefined, 
      undefined, 
      parsedLimit,
      parsedOffset
    );

    return {
      success: true,
      data: data.map(toWaterDataView),
      total: data.length,
      limit: parsedLimit,
      offset: parsedOffset
    };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Obtener el último registro' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiHeader({ name: 'x-user-id', required: false })
  async getLatest(
    @Query('userId') userId?: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const effectiveUserId = userId || headerUserId;
    const latest = await this.waterQualityService.getLatest(effectiveUserId);
    
    // Log para debugging
    console.log('Enviando último registro:', {
      id: latest.id,
      calidad: latest.calidad,
      categoria: latest.calidadCategoria
    });

    return {
      success: true,
      data: toWaterDataView(latest)
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiHeader({ name: 'x-user-id', required: false })
  async getStats(
    @Query('userId') userId?: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const effectiveUserId = userId || headerUserId;
    const stats = await this.waterQualityService.getStats(effectiveUserId);
    
    return {
      success: true,
      data: stats
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro por ID' })
  async findOne(@Param('id') id: string) {
    const record = await this.waterQualityService.findOne(id);
    
    return {
      success: true,
      data: toWaterDataView(record)
    };
  }

  @Post('upload/csv')
  @ApiOperation({ summary: 'Subir archivo CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiHeader({ name: 'x-user-id', required: false })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        deviceId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('deviceId') bodyDeviceId?: string,
    @Headers('x-user-id') headerUserId?: string,
  ): Promise<CsvUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    const csvDeviceId = bodyDeviceId || 'csv-upload';
    return await this.waterQualityService.processCsvFile(file.buffer, headerUserId || null, csvDeviceId);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calcular calidad sin guardar' })
  async calculateCalidad(@Body() params: any) {
    return await this.waterQualityService.calculateOnly(params);
  }
}