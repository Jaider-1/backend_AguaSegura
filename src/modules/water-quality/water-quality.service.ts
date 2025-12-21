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