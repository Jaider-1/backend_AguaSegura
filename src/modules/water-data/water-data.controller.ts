import { 
  Controller, 
  Post, 
  Body, 
  UploadedFile, 
  UseInterceptors,
  Query,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Express } from 'express';
import { WaterDataService } from './water-data.service';
import { 
  CreateWaterDataDto, 
  WaterDataResponseDto, 
  CsvUploadResponseDto 
} from './dto/create-water-data.dto';

@ApiTags('water-data')
@Controller('water-data')
export class WaterDataController {
  constructor(private readonly waterDataService: WaterDataService) {}

  @Post('upload/json')
  @ApiOperation({ 
    summary: 'Subir datos en formato JSON',
    description: 'Recibe un objeto JSON con los datos de medición'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Datos procesados exitosamente',
    type: WaterDataResponseDto
  })
  async uploadJson(
    @Body() createDto: CreateWaterDataDto
  ): Promise<WaterDataResponseDto> {
    return await this.waterDataService.processWaterData(createDto);
  }

  @Post('upload/csv')
  @ApiOperation({ 
    summary: 'Subir datos en formato CSV',
    description: 'Recibe un archivo CSV con los datos de medición'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo CSV con datos de agua',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        user_id: {
          type: 'string',
          description: 'ID del usuario (opcional)',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'CSV procesado exitosamente',
    type: CsvUploadResponseDto
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Query('user_id') userId?: string
  ): Promise<CsvUploadResponseDto> {
    // Validar archivo
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('El archivo debe ser un CSV');
    }

    return await this.waterDataService.processCsvFile(file.buffer, userId);
  }

  @Post('upload/csv/text')
  @ApiOperation({ 
    summary: 'Subir datos CSV como texto',
    description: 'Recibe contenido CSV como texto plano'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'CSV procesado exitosamente',
    type: CsvUploadResponseDto
  })
  @ApiBody({
    description: 'Contenido CSV como texto',
    schema: {
      type: 'object',
      properties: {
        csv_content: {
          type: 'string',
          description: 'Contenido CSV en formato texto',
        },
        user_id: {
          type: 'string',
          description: 'ID del usuario (opcional)',
        },
      },
      required: ['csv_content'],
    },
  })
  async uploadCsvText(
    @Body('csv_content') csvContent: string,
    @Body('user_id') userId?: string
  ): Promise<CsvUploadResponseDto> {
    if (!csvContent) {
      throw new BadRequestException('No se proporcionó contenido CSV');
    }

    const buffer = Buffer.from(csvContent, 'utf-8');
    return await this.waterDataService.processCsvFile(buffer, userId);
  }

  @Post('upload/batch')
  @ApiOperation({ 
    summary: 'Subir múltiples registros JSON',
    description: 'Recibe un array de objetos JSON'
  })
  @ApiResponse({ status: 201, description: 'Lote procesado exitosamente' })
  async uploadBatch(
    @Body() createDtos: CreateWaterDataDto[]
  ): Promise<{
    success: boolean;
    message: string;
    processed: number;
    failed: number;
    results: WaterDataResponseDto[];
  }> {
    const results: WaterDataResponseDto[] = [];
    let processed = 0;
    let failed = 0;

    for (const dto of createDtos) {
      try {
        const result = await this.waterDataService.processWaterData(dto);
        results.push(result);
        processed++;
      } catch (error) {
        failed++;
        results.push({
          success: false,
          message: `Error: ${error}`,
          water_quantity_id: undefined,
          water_quality_id: undefined,
          recommendation_id: undefined,
          data: {
            fecha_hora: dto.fecha_hora,
            cantidad_porcentual_agua: dto.cantidad_porcentual_agua,
          },
        });
      }
    }

    return {
      success: true,
      message: `Lote procesado: ${processed} exitosos, ${failed} fallidos`,
      processed,
      failed,
      results,
    };
  }

  @Post('simulate/csv')
  @ApiOperation({ 
    summary: 'Generar CSV de ejemplo',
    description: 'Devuelve un CSV de ejemplo para pruebas'
  })
  @ApiResponse({ status: 200, description: 'CSV de ejemplo generado' })
  async generateExampleCsv(): Promise<{ csv: string }> {
    const exampleCsv = `fecha_hora,cantidad_porcentual_agua,ph,temperatura,turbidez,conductividad_electrica,oxigeno_disuelto,device_id
2024-01-15T10:00:00Z,75.5,7.2,22.5,2.8,280.0,7.8,sensor-001
2024-01-15T11:00:00Z,72.3,7.0,23.1,3.2,310.5,6.9,sensor-001
2024-01-15T12:00:00Z,68.8,6.8,22.8,4.5,350.2,5.5,sensor-001
2024-01-15T13:00:00Z,65.2,6.5,23.5,5.8,420.7,4.8,sensor-002
2024-01-15T14:00:00Z,70.1,7.5,24.0,2.1,260.3,8.2,sensor-002`;

    return { csv: exampleCsv };
  }
}
