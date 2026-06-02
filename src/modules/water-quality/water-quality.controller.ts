// src/modules/water-quality/water-quality.controller.ts
import { Controller, Get, Post, Body, Param, Query, BadRequestException, UploadedFile, UseInterceptors, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { WaterQualityService } from './water-quality.service';
import { CreateWaterQualityDto } from './dto/create-water-quality.dto';
import { CsvUploadResponseDto } from './dto/water-quality-upload.dto';
import { WaterQuality } from './entities/water-quality.entity';

// Transformador para respuestas API - versión más robusta
const toWaterDataView = (record?: WaterQuality) => {
  if (!record) return null;

  // Convierte campos decimales (TypeORM puede retornar strings) a number
  const safeNumber = (v: any) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // Log para debugging (solo campos clave)
  console.log('Transformando registro:', {
    id: record.id,
    calidad: record.calidad,
    calidadCategoria: record.calidadCategoria,
  });

  return {
    id: record.id,
    fecha_hora: record.measuredAt ? new Date(record.measuredAt).toISOString() : null,
    // Parámetros crudos (coerción segura a número)
    ph: safeNumber(record.ph),
    temperatura: safeNumber(record.temperature),
    turbidez: safeNumber(record.turbidity),
    conductividad: safeNumber(record.conductivity),
    oxigeno: safeNumber(record.dissolvedOxygen),
    // Valores para el frontend - con defaults sensatos
    calidad: safeNumber(record.calidad) ?? 0,
    categoria: record.calidadCategoria || 'sin riesgo',
    color: record.calidadColor || 'green',
    // Metadata
    deviceId: record.deviceId || null,
    userId: record.userId || null,
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : null,
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

  @Get('single')
  @ApiOperation({ summary: 'Obtener un solo registro ordenado y sin duplicados' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'index', required: false, description: 'Posición del dato único (0,1,2...)' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiHeader({ name: 'x-user-id', required: false })
  async getSingleOrdered(
    @Query('userId') userId?: string,
    @Query('index') index?: string,
    @Query('order') order?: string,
    @Headers('x-user-id') headerUserId?: string,
  ) {
    const effectiveUserId = userId || headerUserId;
    const parsedIndex = index ? Number(index) : 0;

    if (!Number.isInteger(parsedIndex) || parsedIndex < 0) {
      throw new BadRequestException('El parámetro index debe ser un entero mayor o igual a 0');
    }

    const normalizedOrder = (order || 'DESC').toUpperCase();
    if (normalizedOrder !== 'ASC' && normalizedOrder !== 'DESC') {
      throw new BadRequestException('El parámetro order debe ser ASC o DESC');
    }

    const record = await this.waterQualityService.getSingleOrderedUnique(
      effectiveUserId,
      parsedIndex,
      normalizedOrder as 'ASC' | 'DESC',
    );

    return {
      success: true,
      index: parsedIndex,
      order: normalizedOrder,
      data: toWaterDataView(record),
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
    @UploadedFile() file: { buffer: Buffer } | undefined,
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
