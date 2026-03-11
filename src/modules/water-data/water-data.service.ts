import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { WaterQuantity } from '../water-quantity/entities/water-quantity.entity';
import { WaterQuality } from '../water-quality/entities/water-quality.entity';
import { CreateWaterDataDto, WaterDataResponseDto, CsvUploadResponseDto } from './dto/create-water-data.dto';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class WaterDataService {
  private readonly logger = new Logger(WaterDataService.name);

  constructor(
    @InjectRepository(WaterQuantity)
    private waterQuantityRepository: Repository<WaterQuantity>,
    
    @InjectRepository(WaterQuality)
    private waterQualityRepository: Repository<WaterQuality>,
    
    private readonly recommendationsService: RecommendationsService,
  ) {}

  // Procesar un solo registro
  async processWaterData(
    createDto: CreateWaterDataDto,
    generateRecommendations: boolean = true,
  ): Promise<WaterDataResponseDto> {
    try {
      this.logger.log(`Procesando datos: ${createDto.fecha_hora}`);
      
      // Calcular IRCA
      const irca = this.calculateIRCA(createDto);
      
      // Crear registros
      const waterQuantity = await this.createWaterQuantity(createDto, irca);
      const waterQuality = await this.createWaterQuality(createDto, irca);
      
      // Generar recomendación (opcional)
      let recommendationId: string | undefined;
      if (generateRecommendations) {
        try {
          const recommendation = await this.recommendationsService.generateFromQuantityData({
            level: createDto.cantidad_porcentual_agua,
            measuredAt: createDto.fecha_hora,
          });
          
          recommendationId = Array.isArray(recommendation) && recommendation.length > 0 ? recommendation[0].id : undefined;
        } catch (recError) {
          this.logger.warn(`No se pudo generar recomendación: ${recError instanceof Error ? recError.message : String(recError)}`);
        }
      }

      return {
        success: true,
        message: 'Datos procesados exitosamente',
        water_quantity_id: waterQuantity.id,
        water_quality_id: waterQuality.id,
        recommendation_id: recommendationId,
        data: {
          fecha_hora: createDto.fecha_hora,
          cantidad_porcentual_agua: createDto.cantidad_porcentual_agua,
          ph: createDto.ph,
          temperatura: createDto.temperatura,
          turbidez: createDto.turbidez,
          conductividad_electrica: createDto.conductividad_electrica,
          oxigeno_disuelto: createDto.oxigeno_disuelto,
          device_id: createDto.device_id,
        },
      };
    } catch (error) {
      this.logger.error(`Error procesando datos: ${error}`);
      throw error;
    }
  }

  // Procesar CSV
  async processCsvFile(csvBuffer: Buffer, userId?: string): Promise<CsvUploadResponseDto> {
    try {
      // Parsear CSV
      const records: Array<Record<string, any>> = parse(csvBuffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          // Convertir números
          if (context.column === 'cantidad_porcentual_agua' || 
              context.column === 'ph' || 
              context.column === 'temperatura' || 
              context.column === 'turbidez' || 
              context.column === 'conductividad_electrica' || 
              context.column === 'oxigeno_disuelto') {
            return value ? parseFloat(value) : undefined;
          }
          return value;
        },
      });

      this.logger.log(`CSV parseado: ${records.length} registros encontrados`);

      const failedRecords: Array<{ row: number; data: any; error: string }> = [];
      let processed = 0;

      // Procesar cada registro
      for (let i = 0; i < records.length; i++) {
        const row = i + 2; // +2 porque CSV tiene header y es 1-based
        const record = records[i];

        try {
          // Validar campos requeridos
          if (!record.fecha_hora || record.cantidad_porcentual_agua === undefined) {
            throw new Error('Campos requeridos faltantes: fecha_hora y cantidad_porcentual_agua');
          }

          // Crear DTO
          const createDto: CreateWaterDataDto = {
            fecha_hora: record.fecha_hora,
            cantidad_porcentual_agua: parseFloat(record.cantidad_porcentual_agua),
            ph: record.ph ? parseFloat(record.ph) : undefined,
            temperatura: record.temperatura ? parseFloat(record.temperatura) : undefined,
            turbidez: record.turbidez ? parseFloat(record.turbidez) : undefined,
            conductividad_electrica: record.conductividad_electrica ? parseFloat(record.conductividad_electrica) : undefined,
            oxigeno_disuelto: record.oxigeno_disuelto ? parseFloat(record.oxigeno_disuelto) : undefined,
            device_id: record.device_id || `csv-import-${Date.now()}`,
            user_id: userId,
          };

          // Procesar registro (sin recomendaciones)
          await this.processWaterData(createDto, false);
          processed++;
          
        } catch (error) {
          failedRecords.push({
            row,
            data: record,
            error: error instanceof Error ? error.message : String(error),
          });
          this.logger.warn(`Error en fila ${row}: ${error}`);
        }
      }

      return {
        success: true,
        message: `CSV procesado: ${processed} exitosos, ${failedRecords.length} fallidos`,
        total_records: records.length,
        processed,
        failed: failedRecords.length,
        failed_records: failedRecords.length > 0 ? failedRecords : undefined,
      };

    } catch (error) {
      this.logger.error(`Error procesando CSV: ${error}`);
      throw new BadRequestException(`Error procesando CSV: ${error}`);
    }
  }

  // Métodos auxiliares (igual que antes, pero sin ubicacion)
  private async createWaterQuantity(createDto: CreateWaterDataDto, irca: number): Promise<WaterQuantity> {
    const waterQuantityData = this.waterQuantityRepository.create({
      volume: this.calculateVolume(createDto.cantidad_porcentual_agua),
      flowRate: this.estimateFlowRate(createDto.cantidad_porcentual_agua, irca),
      level: createDto.cantidad_porcentual_agua,
      pressure: this.estimatePressure(createDto.cantidad_porcentual_agua),
      deviceId: createDto.device_id,
      userId: createDto.user_id,
      createdAt: new Date(createDto.fecha_hora),
    });

    return await this.waterQuantityRepository.save(waterQuantityData);
  }

  private async createWaterQuality(createDto: CreateWaterDataDto, irca: number): Promise<WaterQuality> {
    const waterQualityData = this.waterQualityRepository.create({
      irca: irca,
      ph: createDto.ph,
      turbidity: createDto.turbidez,
      temperature: createDto.temperatura,
      deviceId: createDto.device_id,
      measuredAt: new Date(createDto.fecha_hora),
      userId: createDto.user_id,
      createdAt: new Date(createDto.fecha_hora),
    });

    return await this.waterQualityRepository.save(waterQualityData);
  }

  private calculateIRCA(createDto: CreateWaterDataDto): number {
    let irca = 50; // Valor base
    
    if (createDto.ph !== undefined) {
      if (createDto.ph < 6.5 || createDto.ph > 8.5) {
        irca += 15;
      }
    }
    
    if (createDto.turbidez !== undefined) {
      if (createDto.turbidez > 5) {
        irca += (createDto.turbidez - 5) * 2;
      }
    }
    
    if (createDto.oxigeno_disuelto !== undefined) {
      if (createDto.oxigeno_disuelto < 5) {
        irca += (5 - createDto.oxigeno_disuelto) * 3;
      }
    }
    
    if (createDto.conductividad_electrica !== undefined) {
      if (createDto.conductividad_electrica > 500) {
        irca += (createDto.conductividad_electrica - 500) / 100;
      }
    }
    
    return Math.max(0, Math.min(100, irca));
  }

  private calculateVolume(porcentaje: number): number {
    return (porcentaje / 100) * 1000;
  }

  private estimateFlowRate(porcentaje: number, irca: number): number {
    const baseFlow = 2.5;
    const quantityFactor = porcentaje / 100;
    const qualityFactor = (100 - irca) / 100;
    return baseFlow * quantityFactor * qualityFactor;
  }

  private estimatePressure(porcentaje: number): number {
    return porcentaje * 0.1;
  }
}
