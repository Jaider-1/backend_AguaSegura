// src/modules/water-quality/water-quality.service.ts
import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { parse } from 'csv-parse/sync';
import { WaterQuality } from './entities/water-quality.entity';
import { CreateWaterQualityDto } from './dto/create-water-quality.dto';
import { CsvUploadResponseDto } from './dto/water-quality-upload.dto';

@Injectable()
export class WaterQualityService {
  private readonly logger = new Logger(WaterQualityService.name);

  // Pesos ajustados para ICA-NSF (normalizados para 5 parámetros)
  private readonly WEIGHTS = {
    OD: 0.321,      // Oxígeno Disuelto - 32.1%
    PH: 0.207,      // pH - 20.7%
    TEMP: 0.189,    // Temperatura - 18.9%
    TURB: 0.151,    // Turbiedad - 15.1%
    COND: 0.132     // Conductividad - 13.2%
  };

  constructor(
    @InjectRepository(WaterQuality)
    private waterQualityRepository: Repository<WaterQuality>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Valida si un userId existe en la DB
   */
  async validateUserId(userId: string): Promise<boolean> {
    if (!userId) return false;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return !!user;
  }

  /**
   * Calcula el subíndice de Oxígeno Disuelto (0-100)
   */
  private calculateODSubindex(od: number): number {
    if (!od || od <= 0) return 0;
    
    // A 20°C y nivel del mar, saturación ≈ 9.1 mg/L
    const saturation = (od / 9.1) * 100;
    
    if (saturation >= 95) return 100;
    if (saturation >= 80) return 90;
    if (saturation >= 60) return 70;
    if (saturation >= 40) return 50;
    if (saturation >= 20) return 30;
    return 10;
  }

  /**
   * Calcula el subíndice de pH (0-100)
   */
  private calculatePHSubindex(ph: number): number {
    if (!ph) return 0;
    
    if (ph >= 7.0 && ph <= 8.0) return 100;
    if (ph >= 6.5 && ph < 7.0) return 90;
    if (ph > 8.0 && ph <= 8.5) return 90;
    if (ph >= 6.0 && ph < 6.5) return 70;
    if (ph > 8.5 && ph <= 9.0) return 70;
    if (ph >= 5.0 && ph < 6.0) return 50;
    if (ph > 9.0 && ph <= 10.0) return 50;
    if (ph >= 4.0 && ph < 5.0) return 30;
    if (ph > 10.0 && ph <= 11.0) return 30;
    return 10;
  }

  /**
   * Calcula el subíndice de Temperatura (0-100)
   */
  private calculateTempSubindex(temp: number): number {
    if (!temp) return 0;
    
    const deviation = Math.abs(temp - 20);
    
    if (deviation <= 2) return 100;
    if (deviation <= 5) return 90;
    if (deviation <= 8) return 70;
    if (deviation <= 12) return 50;
    if (deviation <= 16) return 30;
    return 10;
  }

  /**
   * Calcula el subíndice de Turbiedad (0-100)
   */
  private calculateTurbSubindex(turb: number): number {
    if (!turb) return 0;
    
    if (turb < 5) return 95;
    if (turb < 10) return 85;
    if (turb < 20) return 70;
    if (turb < 50) return 50;
    if (turb < 100) return 30;
    if (turb < 200) return 20;
    return 10;
  }

  /**
   * Calcula el subíndice de Conductividad (0-100)
   */
  private calculateCondSubindex(cond: number): number {
    if (!cond) return 0;
    
    if (cond < 500) return 95;
    if (cond < 1000) return 80;
    if (cond < 1500) return 60;
    if (cond < 2000) return 40;
    if (cond < 3000) return 25;
    return 10;
  }

  /**
   * Convierte ICA a IRCA según la tabla:
   * ICA 91-100 → IRCA 0-5
   * ICA 71-90  → IRCA 5.1-14
   * ICA 51-70  → IRCA 14.1-35
   * ICA 26-50  → IRCA 35.1-80
   * ICA 0-25   → IRCA 80.1-100
   * 
   * Simplificado a 3 categorías para el frontend:
   * IRCA 0-5    → Verde, Sin Riesgo
   * IRCA 5.1-35 → Amarillo, Medio
   * IRCA 35.1-100 → Rojo, Inviable
   */
  private convertICAtoIRCA(ica: number): { 
    irca: number; 
    categoria: string; 
    color: string 
  } {
    let irca: number;
    let categoria: string;
    let color: string;

    if (ica >= 91) {
      // ICA Excelente → IRCA 0-5
      irca = ((ica - 91) / 9) * 5; // Mapeo lineal 91-100 → 0-5
      categoria = 'sin riesgo';
      color = 'green';
    } 
    else if (ica >= 71) {
      // ICA Buena → IRCA 5.1-14
      irca = 5.1 + ((ica - 71) / 19) * (14 - 5.1);
      categoria = irca <= 5 ? 'sin riesgo' : 'medio';
      color = irca <= 5 ? 'green' : (irca <= 35 ? 'yellow' : 'red');
    } 
    else if (ica >= 51) {
      // ICA Regular → IRCA 14.1-35
      irca = 14.1 + ((ica - 51) / 19) * (35 - 14.1);
      categoria = 'medio';
      color = 'yellow';
    } 
    else if (ica >= 26) {
      // ICA Mala → IRCA 35.1-80
      irca = 35.1 + ((ica - 26) / 24) * (80 - 35.1);
      categoria = 'inviable';
      color = 'red';
    } 
    else {
      // ICA Pésima → IRCA 80.1-100
      irca = 80.1 + (ica / 25) * 19.9;
      categoria = 'inviable';
      color = 'red';
    }

    // Redondear a 2 decimales y asegurar rango 0-100
    irca = Math.max(0, Math.min(100, Math.round(irca * 100) / 100));

    // Simplificar a 3 categorías para el frontend
    if (irca <= 5) {
      categoria = 'sin riesgo';
      color = 'green';
    } else if (irca <= 35) {
      categoria = 'medio';
      color = 'yellow';
    } else {
      categoria = 'inviable';
      color = 'red';
    }

    return { irca, categoria, color };
  }

  /**
   * Calcula el ICA completo y lo convierte a IRCA
   */
  private calculateCalidad(params: {
    ph?: number;
    turbidez?: number;
    conductividad?: number;
    oxigeno?: number;
    temperatura?: number;
  }): {
    calidad: number;           // IRCA final
    calidadCategoria: string;  // 'sin riesgo', 'medio', 'inviable'
    calidadColor: string;      // 'green', 'yellow', 'red'
    icaOriginal: number;       // ICA calculado
    subindices: any;           // Subíndices para debugging
  } {
    this.logger.log('Calculando calidad para parámetros:', params);

    // Calcular subíndices
    const subindices = {
      od: params.oxigeno ? this.calculateODSubindex(params.oxigeno) : 0,
      ph: params.ph ? this.calculatePHSubindex(params.ph) : 0,
      temperatura: params.temperatura ? this.calculateTempSubindex(params.temperatura) : 0,
      turbidez: params.turbidez ? this.calculateTurbSubindex(params.turbidez) : 0,
      conductividad: params.conductividad ? this.calculateCondSubindex(params.conductividad) : 0,
    };

    this.logger.log('Subíndices calculados:', subindices);

    // Calcular ICA ponderado
    const ica = 
      (subindices.od * this.WEIGHTS.OD) +
      (subindices.ph * this.WEIGHTS.PH) +
      (subindices.temperatura * this.WEIGHTS.TEMP) +
      (subindices.turbidez * this.WEIGHTS.TURB) +
      (subindices.conductividad * this.WEIGHTS.COND);

    const icaValue = Math.round(ica * 100) / 100;
    this.logger.log(`ICA calculado: ${icaValue}`);

    // Convertir ICA a IRCA
    const { irca, categoria, color } = this.convertICAtoIRCA(icaValue);
    this.logger.log(`IRCA resultante: ${irca} - ${categoria} (${color})`);

    return {
      calidad: irca,
      calidadCategoria: categoria,
      calidadColor: color,
      icaOriginal: icaValue,
      subindices
    };
  }

  /**
   * Crea un nuevo registro con cálculo automático de calidad (ICA → IRCA)
   */
  async create(createDto: CreateWaterQualityDto, userId?: string): Promise<WaterQuality> {
  this.logger.log('Creando nuevo registro con cálculo de calidad');

  // ... validaciones ...

  // Calcular calidad (ICA → IRCA)
  const calidadResult = this.calculateCalidad({
    ph: createDto.pH,
    turbidez: createDto.turbidez,
    conductividad: createDto.conductividad_electrica,
    oxigeno: createDto.oxigeno_disuelto,
    temperatura: createDto.temperatura
  });

  this.logger.log('Resultado calidad calculado:', calidadResult); // ← IMPORTANTE: verifica esto

  // Crear entidad con todos los campos
  const waterQualityData = {
    // Parámetros crudos
    ph: createDto.pH,
    temperature: createDto.temperatura,
    turbidity: createDto.turbidez,
    conductivity: createDto.conductividad_electrica,
    dissolvedOxygen: createDto.oxigeno_disuelto,
    
    // Resultados finales (IRCA)
    calidad: calidadResult.calidad,           // ← DEBE estar aquí
    calidadCategoria: calidadResult.calidadCategoria,
    calidadColor: calidadResult.calidadColor,
      
      // ICA original (para referencia)
      icaOriginal: calidadResult.icaOriginal,
      
      // Subíndices
      subindices: calidadResult.subindices,
      
      // Metadata
      deviceId: createDto.deviceId,
      userId: userId,
      measuredAt: createDto.fecha_hora ? new Date(createDto.fecha_hora) : new Date(),
    };

    const waterQuality = this.waterQualityRepository.create(waterQualityData);
    const saved = await this.waterQualityRepository.save(waterQuality);
    
    this.logger.log(`Registro creado ID: ${saved.id}, Calidad: ${saved.calidad} (${saved.calidadCategoria})`);
    
    return saved;
  }

  /**
   * Procesa archivo CSV y calcula calidad para cada registro
   */
  async processCsvFile(csvBuffer: Buffer, userId: string | null, csvDeviceId: string = 'csv-default'): Promise<CsvUploadResponseDto> {
    try {
      const records: Array<Record<string, any>> = parse(csvBuffer.toString(), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
          const numericColumns = ['pH', 'temperatura', 'turbidez', 'conductividad_electrica', 'oxigeno_disuelto'];
          if (numericColumns.includes(context.column as string)) {
            return value ? parseFloat(value) : undefined;
          }
          return value;
        },
      });

      this.logger.log(`CSV parseado: ${records.length} registros`);

      const failedRecords: Array<{ row: number; data: any; error: string }> = [];
      let processed = 0;

      for (let i = 0; i < records.length; i++) {
        const row = i + 2;
        const record = records[i];

        try {
          const createDto: CreateWaterQualityDto = {
            fecha_hora: record.fecha_hora ? String(record.fecha_hora) : new Date().toISOString(),
            pH: record.pH,
            temperatura: record.temperatura,
            turbidez: record.turbidez,
            conductividad_electrica: record.conductividad_electrica,
            oxigeno_disuelto: record.oxigeno_disuelto,
            deviceId: csvDeviceId
          };

          await this.create(createDto, userId || undefined);
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

  /**
   * Obtiene todos los registros con paginación
   */
  async findAll(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    offset: number = 0,
  ): Promise<WaterQuality[]> {
    const where: Record<string, any> = {};
    
    if (userId) {
      where.userId = userId;
    }

    if (startDate && endDate) {
      where.measuredAt = Between(startDate, endDate);
    }

    const records = await this.waterQualityRepository.find({
      where,
      order: { measuredAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return records;
  }

  /**
   * Obtiene un registro por ID
   */
  async findOne(id: string): Promise<WaterQuality> {
    const waterQuality = await this.waterQualityRepository.findOne({ where: { id } });
    
    if (!waterQuality) {
      throw new NotFoundException('Registro no encontrado');
    }

    return waterQuality;
  }

  /**
   * Obtiene el último registro
   */
  async getLatest(userId?: string): Promise<WaterQuality> {
    const where: Record<string, any> = {};
    if (userId) {
      where.userId = userId;
    }

    const latest = await this.waterQualityRepository.findOne({
      where,
      order: { measuredAt: 'DESC' },
    });

    if (!latest) {
      throw new NotFoundException('No hay registros disponibles');
    }

    return latest;
  }

  /**
   * Obtiene estadísticas de calidad
   */
  async getStats(userId?: string) {
    const where: Record<string, any> = {};
    if (userId) {
      where.userId = userId;
    }

    const records = await this.waterQualityRepository.find({
      where,
      order: { measuredAt: 'DESC' },
    });

    if (records.length === 0) {
      return {
        total: 0,
        promedio: 0,
        maximo: 0,
        minimo: 0,
        porCategoria: {}
      };
    }

    const calidadValues = records.map(r => r.calidad || 0);
    const porCategoria: Record<string, number> = {};

    records.forEach(record => {
      const categoria = record.calidadCategoria || 'desconocido';
      porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
    });

    return {
      total: records.length,
      promedio: Number((calidadValues.reduce((a, b) => a + b, 0) / calidadValues.length).toFixed(2)),
      maximo: Math.max(...calidadValues),
      minimo: Math.min(...calidadValues),
      porCategoria
    };
  }

  /**
   * Endpoint de prueba que muestra el proceso completo
   */
  async calculateOnly(params: {
    ph?: number;
    turbidez?: number;
    conductividad_electrica?: number;
    oxigeno_disuelto?: number;
    temperatura?: number;
  }): Promise<any> {
    const result = this.calculateCalidad({
      ph: params.ph,
      turbidez: params.turbidez,
      conductividad: params.conductividad_electrica,
      oxigeno: params.oxigeno_disuelto,
      temperatura: params.temperatura
    });

    return {
      parametros_ingresados: params,
      subindices_calculados: result.subindices,
      ica_calculado: result.icaOriginal,
      resultado_final: {
        calidad: result.calidad,
        categoria: result.calidadCategoria,
        color: result.calidadColor
      },
      interpretacion: `El agua presenta nivel de riesgo ${result.calidadCategoria.toUpperCase()} (${result.calidad}%)`
    };
  }
}