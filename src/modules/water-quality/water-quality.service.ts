import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOperator } from 'typeorm';
import { WaterQuality } from './entities/water-quality.entity';
import { CreateWaterQualityDto } from './dto/create-water-quality.dto';

@Injectable()
export class WaterQualityService {
  constructor(
    @InjectRepository(WaterQuality)
    private waterQualityRepository: Repository<WaterQuality>,
  ) {}

  /**
   * Calcula el IRCA según Resolución 2115 de 2007
   * Los puntajes de riesgo asignados son:
   * - Turbiedad: 15 puntos
   * - pH: 1.5 puntos
   * - Los demás parámetros no aplican para IRCA
   */
  private calculateIRCA(params: {
    pH?: number;
    turbidez?: number;
    conductividadElectrica?: number;
    oxigenoDisuelto?: number;
    temperatura?: number;
  }): { irca: number; qualityLevel: string; riskLevel: string; trafficLight: string } {
    
    // Valores de referencia según normativa
    const PH_MIN = 6.5;
    const PH_MAX = 9.0;
    const TURBIDEZ_MAX = 2.0; // UNT (Unidades Nefelométricas de Turbidez)

    // Puntajes de riesgo según Res. 2115
    const PUNTAJE_PH = 1.5;
    const PUNTAJE_TURBIEDAD = 15;
    const PUNTAJE_TOTAL_POSIBLE = 16.5; // Solo pH y turbiedad para estos parámetros

    let puntajeIncumplimiento = 0;
    let parametrosAnalizados = 0;

    // Evaluar pH
    if (params.pH !== undefined) {
      parametrosAnalizados++;
      if (params.pH < PH_MIN || params.pH > PH_MAX) {
        puntajeIncumplimiento += PUNTAJE_PH;
      }
    }

    // Evaluar turbiedad
    if (params.turbidez !== undefined) {
      parametrosAnalizados++;
      if (params.turbidez > TURBIDEZ_MAX) {
        puntajeIncumplimiento += PUNTAJE_TURBIEDAD;
      }
    }

    // Conductividad eléctrica, oxígeno disuelto y temperatura
    // NO aplican para IRCA según normativa, pero los incluimos como información complementaria
    // Si quisieras incluirlos, necesitarías una norma modificada o un índice personalizado

    // Calcular IRCA como porcentaje
    // Si no hay parámetros analizados, retornar 0
    if (parametrosAnalizados === 0) {
      return this.getClassificacion(0);
    }

    // Calcular porcentaje basado en los parámetros analizados
    const irca = (puntajeIncumplimiento / PUNTAJE_TOTAL_POSIBLE) * 100;

    return this.getClassificacion(irca);
  }

  /**
   * Clasifica el IRCA según la tabla de la Resolución 2115
   */
  private getClassificacion(irca: number): { 
    irca: number; 
    qualityLevel: string; 
    riskLevel: string; 
    trafficLight: string;
  } {
    // Asegurar que IRCA esté entre 0 y 100
    const ircaValue = Math.max(0, Math.min(100, irca));
    
    let qualityLevel = '';
    let riskLevel = '';
    let trafficLight = '';

    // Clasificación según Resolución 2115
    if (ircaValue <= 5) {
      qualityLevel = 'excelente';
      riskLevel = 'sin riesgo';
      trafficLight = 'green';
    } else if (ircaValue <= 14) {
      qualityLevel = 'buena';
      riskLevel = 'bajo';
      trafficLight = 'green';
    } else if (ircaValue <= 35) {
      qualityLevel = 'regular';
      riskLevel = 'medio';
      trafficLight = 'yellow';
    } else if (ircaValue <= 80) {
      qualityLevel = 'mala';
      riskLevel = 'alto';
      trafficLight = 'red';
    } else {
      qualityLevel = 'peligrosa';
      riskLevel = 'inviable sanitariamente';
      trafficLight = 'red';
    }

    return {
      irca: Number(ircaValue.toFixed(2)),
      qualityLevel,
      riskLevel,
      trafficLight
    };
  }

  /**
   * Calcula un índice personalizado que incluye todos los parámetros
   * (útil para monitoreo ambiental, no para IRCA oficial)
   */
  private calculateCustomIndex(params: {
    pH?: number;
    turbidez?: number;
    conductividadElectrica?: number;
    oxigenoDisuelto?: number;
    temperatura?: number;
  }): number {
    let customIndex = 0;
    let parametrosValidos = 0;

    // pH (ideal 7, rango 6.5-8.5)
    if (params.pH !== undefined) {
      const phScore = Math.abs(7 - params.pH) * 5;
      customIndex += Math.min(20, phScore);
      parametrosValidos++;
    }

    // Turbidez (ideal < 2 UNT)
    if (params.turbidez !== undefined) {
      const turbScore = params.turbidez > 2 ? Math.min(25, params.turbidez * 3) : 0;
      customIndex += turbScore;
      parametrosValidos++;
    }

    // Conductividad (ideal < 1000 µS/cm)
    if (params.conductividadElectrica !== undefined) {
      const condScore = params.conductividadElectrica > 1000 
        ? Math.min(15, (params.conductividadElectrica - 1000) / 100) 
        : 0;
      customIndex += condScore;
      parametrosValidos++;
    }

    // Oxígeno disuelto (ideal > 5 mg/L)
    if (params.oxigenoDisuelto !== undefined) {
      const oxyScore = params.oxigenoDisuelto < 5 
        ? Math.min(20, (5 - params.oxigenoDisuelto) * 4) 
        : 0;
      customIndex += oxyScore;
      parametrosValidos++;
    }

    // Temperatura (ideal 15-25°C)
    if (params.temperatura !== undefined) {
      const tempScore = params.temperatura < 15 || params.temperatura > 25
        ? Math.min(10, Math.abs(20 - params.temperatura) * 2)
        : 0;
      customIndex += tempScore;
      parametrosValidos++;
    }

    // Normalizar basado en cantidad de parámetros (máximo 100)
    return parametrosValidos > 0 
      ? Math.min(100, (customIndex / parametrosValidos) * (100 / 20)) 
      : 0;
  }

  async createFromPlainData(plainDto: CreateWaterQualityDto, userId?: string): Promise<WaterQuality> {
    // Calcular IRCA oficial según normativa
    const ircaResult = this.calculateIRCA({
      pH: plainDto.pH,
      turbidez: plainDto.turbidez,
      conductividadElectrica: plainDto.conductividad_electrica,
      oxigenoDisuelto: plainDto.oxigeno_disuelto,
      temperatura: plainDto.temperatura
    });

    // Calcular índice personalizado (opcional)
    const customIndex = this.calculateCustomIndex({
      pH: plainDto.pH,
      turbidez: plainDto.turbidez,
      conductividadElectrica: plainDto.conductividad_electrica,
      oxigenoDisuelto: plainDto.oxigeno_disuelto,
      temperatura: plainDto.temperatura
    });

    // Convertir formato plano a formato interno
    const waterQualityData = {
      irca: ircaResult.irca,
      qualityLevel: ircaResult.qualityLevel,
      riskLevel: ircaResult.riskLevel,
      trafficLight: ircaResult.trafficLight,
      customIndex: Number(customIndex.toFixed(2)), // Campo adicional si lo tienes en tu entidad
      ph: plainDto.pH,
      pH: plainDto.pH,
      turbidity: plainDto.turbidez,
      turbidez: plainDto.turbidez,
      temperature: plainDto.temperatura,
      temperatura: plainDto.temperatura,
      conductividadElectrica: plainDto.conductividad_electrica,
      oxigenoDisuelto: plainDto.oxigeno_disuelto,
      deviceId: plainDto.deviceId,
      userId: userId || plainDto.userId,
      measuredAt: plainDto.fecha_hora ? new Date(plainDto.fecha_hora) : new Date()
    };

    const waterQuality = this.waterQualityRepository.create(waterQualityData);
    return this.waterQualityRepository.save(waterQuality);
  }

  async create(createDto: CreateWaterQualityDto, userId?: string): Promise<WaterQuality> {
    const waterQuality = this.waterQualityRepository.create({
      ...createDto,
      userId,
      measuredAt: createDto.measuredAt || new Date(),
    });

    return this.waterQualityRepository.save(waterQuality);
  }

  async findAll(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
  ): Promise<WaterQuality[]> {
    const where: Record<string, string | FindOperator<Date>> = {};
    
    if (userId) {
      where.userId = userId;
    }

    if (startDate && endDate) {
      where.measuredAt = Between(startDate, endDate);
    }

    return this.waterQualityRepository.find({
      where,
      order: { measuredAt: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: string): Promise<WaterQuality> {
    const waterQuality = await this.waterQualityRepository.findOne({ where: { id } });
    
    if (!waterQuality) {
      throw new NotFoundException('Registro de calidad de agua no encontrado');
    }

    return waterQuality;
  }

  async getLatest(userId?: string): Promise<WaterQuality> {
    const where: Record<string, string> = {};
    if (userId) {
      where.userId = userId;
    }

    const latest = await this.waterQualityRepository.findOne({
      where,
      order: { measuredAt: 'DESC' },
    });

    if (!latest) {
      throw new NotFoundException('No hay registros de calidad de agua');
    }

    return latest;
  }

  async getStats(userId?: string) {
    const where: Record<string, string> = {};
    if (userId) {
      where.userId = userId;
    }

    const stats = await this.waterQualityRepository
      .createQueryBuilder('water_quality')
      .select([
        'AVG(water_quality.irca) as avgIrc',
        'MIN(water_quality.irca) as minIrc',
        'MAX(water_quality.irca) as maxIrc',
        'COUNT(water_quality.id) as totalRecords',
        'water_quality.qualityLevel as qualityLevel',
        'COUNT(water_quality.qualityLevel) as levelCount'
      ])
      .where(where)
      .groupBy('water_quality.qualityLevel')
      .getRawMany();

    return stats;
  }

  /**
   * Endpoint específico para calcular IRCA sin guardar
   */
  async calculateIRCAOnly(params: {
    pH?: number;
    turbidez?: number;
    conductividad_electrica?: number;
    oxigeno_disuelto?: number;
    temperatura?: number;
  }): Promise<any> {
    const ircaResult = this.calculateIRCA({
      pH: params.pH,
      turbidez: params.turbidez,
      conductividadElectrica: params.conductividad_electrica,
      oxigenoDisuelto: params.oxigeno_disuelto,
      temperatura: params.temperatura
    });

    const customIndex = this.calculateCustomIndex({
      pH: params.pH,
      turbidez: params.turbidez,
      conductividadElectrica: params.conductividad_electrica,
      oxigenoDisuelto: params.oxigeno_disuelto,
      temperatura: params.temperatura
    });

    // Evaluación individual de parámetros
    const evaluacion = {
      ph: {
        valor: params.pH,
        cumple: params.pH ? (params.pH >= 6.5 && params.pH <= 9.0) : null,
        observacion: params.pH ? (params.pH >= 6.5 && params.pH <= 9.0 ? 'Aceptable' : 'Fuera de rango (6.5-9.0)') : 'No evaluado'
      },
      turbidez: {
        valor: params.turbidez,
        cumple: params.turbidez ? params.turbidez <= 2.0 : null,
        observacion: params.turbidez ? (params.turbidez <= 2.0 ? 'Aceptable' : 'Excede máximo 2.0 UNT') : 'No evaluado'
      },
      conductividad: {
        valor: params.conductividad_electrica,
        observacion: 'No aplica para IRCA (valor referencial)'
      },
      oxigenoDisuelto: {
        valor: params.oxigeno_disuelto,
        observacion: 'No aplica para IRCA (parámetro para fuentes superficiales)'
      },
      temperatura: {
        valor: params.temperatura,
        observacion: 'No aplica para IRCA (valor referencial)'
      }
    };

    return {
      irca_oficial: ircaResult,
      indice_personalizado: Number(customIndex.toFixed(2)),
      fecha_calculo: new Date().toISOString(),
      normativa: 'Resolución 2115 de 2007',
      parametros_evaluados: evaluacion,
      interpretacion: `El agua presenta nivel de riesgo ${ircaResult.riskLevel.toUpperCase()} (${ircaResult.qualityLevel})`
    };
  }
}