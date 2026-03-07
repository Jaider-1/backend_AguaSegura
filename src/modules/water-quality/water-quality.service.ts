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

  private calculateIrcFromParams(params: {
    pH?: number;
    turbidez?: number;
    conductividadElectrica?: number;
    oxigenoDisuelto?: number;
    temperatura?: number;
  }): number {
    let irca = 50; // Valor por defecto
    
    // Lógica simplificada para cálculo de IRCA
    // En producción, usar fórmula real según normativa
    if (params.pH !== undefined) {
      const phScore = Math.abs(7 - (params.pH || 7)) * 10;
      irca += phScore * 0.2;
    }
    
    if (params.turbidez !== undefined) {
      const turbScore = (params.turbidez || 0) * 0.5;
      irca += turbScore * 0.2;
    }
    
    if (params.conductividadElectrica !== undefined) {
      const condScore = (params.conductividadElectrica || 0) / 100;
      irca += condScore * 0.2;
    }
    
    if (params.oxigenoDisuelto !== undefined) {
      const oxyScore = Math.max(0, 8 - (params.oxigenoDisuelto || 8)) * 5;
      irca += oxyScore * 0.2;
    }
    
    if (params.temperatura !== undefined) {
      const tempScore = Math.abs(25 - (params.temperatura || 25));
      irca += tempScore * 0.2;
    }
    
    // Asegurar que esté entre 0 y 100
    return Math.max(0, Math.min(100, irca));
  }

  /**
   * Crear registro desde datos planos
   */
  async createFromPlainData(plainDto: CreateWaterQualityDto, userId?: string): Promise<WaterQuality> {
    // Calcular IRCA a partir de los parámetros
    const irca = this.calculateIrcFromParams({
      pH: plainDto.pH,
      turbidez: plainDto.turbidez,
      conductividadElectrica: plainDto.conductividad_electrica,
      oxigenoDisuelto: plainDto.oxigeno_disuelto,
      temperatura: plainDto.temperatura
    });

    // Convertir formato plano a formato interno
    const waterQualityData = {
      irca,
      ph: plainDto.pH,
      pH: plainDto.pH, // Guardar también en campo español
      turbidity: plainDto.turbidez,
      turbidez: plainDto.turbidez, // Guardar también en campo español
      temperature: plainDto.temperatura,
      temperatura: plainDto.temperatura, // Guardar también en campo español
      conductividadElectrica: plainDto.conductividad_electrica,
      oxigenoDisuelto: plainDto.oxigeno_disuelto,
      deviceId: plainDto.deviceId,
      userId: userId || plainDto.userId,
      measuredAt: new Date(plainDto.fecha_hora)
    };

    const waterQuality = this.waterQualityRepository.create(waterQualityData);
    return this.waterQualityRepository.save(waterQuality);
  }

  async create(createDto: CreateWaterQualityDto, userId?: string): Promise<WaterQuality> {
    // Calcular niveles basados en IRCA
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
    const [latest] = await this.waterQualityRepository.find({
      where: userId ? { userId } : undefined,
      order: { measuredAt: 'DESC' },
      take: 1,
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

  private calculateLevels(irca: number) {
    let qualityLevel = '';
    let riskLevel = '';
    let trafficLight = '';

    if (irca <= 5) {
      qualityLevel = 'excelente';
      riskLevel = 'sin riesgo';
      trafficLight = 'green';
    } else if (irca <= 14) {
      qualityLevel = 'buena';
      riskLevel = 'bajo';
      trafficLight = 'green';
    } else if (irca <= 35) {
      qualityLevel = 'regular';
      riskLevel = 'medio';
      trafficLight = 'yellow';
    } else if (irca <= 80) {
      qualityLevel = 'mala';
      riskLevel = 'alto';
      trafficLight = 'red';
    } else {
      qualityLevel = 'peligrosa';
      riskLevel = 'inviable';
      trafficLight = 'red';
    }

    return { qualityLevel, riskLevel, trafficLight };
  }
}
