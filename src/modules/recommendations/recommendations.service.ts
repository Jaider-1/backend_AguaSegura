// src/modules/recommendations/recommendations.service.ts
import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In } from 'typeorm';
import { DataSource } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { FilterRecommendationsDto } from './dto/filter-recommendations.dto';
import { RecommendationAlgorithm } from './algorithms/recommendation.algorithm';
import { RecommendationRequestData, RecommendationStats } from '../recommendations/interfaces/recommendation.interface';
import { WaterQualityService } from '../water-quality/water-quality.service';
import { WaterQuantityService } from '../water-quantity/water-quantity.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private recommendationsRepository: Repository<Recommendation>,
    
    private dataSource: DataSource,
    
    private recommendationAlgorithm: RecommendationAlgorithm,
    
    @Inject(forwardRef(() => WaterQualityService))
    private waterQualityService: WaterQualityService,
    
    @Inject(forwardRef(() => WaterQuantityService))
    private waterQuantityService: WaterQuantityService,
    
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  // 1. Método CREATE
  async create(createDto: CreateRecommendationDto): Promise<Recommendation> {
    let expiresAt: Date | null = null;
    if (createDto.expiresAt) {
      expiresAt = new Date(createDto.expiresAt);
    }

    const recommendation = this.recommendationsRepository.create({
      ...createDto,
      expiresAt,
    });

    return this.recommendationsRepository.save(recommendation);
  }

  // 2. Método GENERATE FROM WATER QUALITY
  // src/modules/recommendations/recommendations.service.ts (métodos corregidos)

// 2. Método GENERATE FROM WATER QUALITY (CORREGIDO)
async generateFromWaterQuality(qualityId: string, userId?: string): Promise<Recommendation[]> {
  const qualityData = await this.waterQualityService.findOne(qualityId);
  
  // Calcular IRCA
  const irca = this.recommendationAlgorithm.calculateIRCA(qualityData);
  
  // Obtener datos del usuario si está disponible
  let userData = {};
  if (userId) {
    try {
      const user = await this.usersService.findOne(userId);
      userData = {
        householdSize: user.householdSize,
        reuseDisposition: user.reuseDisposition,
        climateConditions: user.climateConditions,
      };
    } catch (error) {
      console.warn(`No se pudieron obtener datos del usuario ${userId}`);
    }
  }

  const requestData: RecommendationRequestData = {
    userId,
    waterQualityId: qualityId,
    qualityIrc: irca,
    ...userData,
  };

  // Obtener recomendaciones generadas
  const generatedRecs = await this.recommendationAlgorithm.generateRecommendations(requestData);
  
  // Guardar en la base de datos
  const savedRecommendations: Recommendation[] = [];
  
  for (const genRec of generatedRecs) {
    const recommendation = this.recommendationsRepository.create({
      message: genRec.message,
      priorityLevel: genRec.priorityLevel,
      trafficLightColor: genRec.trafficLightColor,
      category: genRec.category,
      parameters: genRec.parameters,
      userId,
      waterQualityId: qualityId,
    });
    
    const saved = await this.recommendationsRepository.save(recommendation);
    savedRecommendations.push(saved);
  }
  
  return savedRecommendations;
}

// 3. Método GENERATE FROM WATER QUANTITY (CORREGIDO)
async generateFromWaterQuantity(quantityId: string, userId?: string): Promise<Recommendation[]> {
  const quantityData = await this.waterQuantityService.findOne(quantityId);
  
  // Obtener datos del usuario si está disponible
  let userData = {};
  if (userId) {
    try {
      const user = await this.usersService.findOne(userId);
      userData = {
        householdSize: user.householdSize,
        reuseDisposition: user.reuseDisposition,
        climateConditions: user.climateConditions,
      };
    } catch (error) {
      console.warn(`No se pudieron obtener datos del usuario ${userId}`);
    }
  }

  const requestData: RecommendationRequestData = {
    userId,
    waterQuantityId: quantityId,
    quantityPercentage: quantityData.level,
    ...userData,
  };

  // Obtener recomendaciones generadas
  const generatedRecs = await this.recommendationAlgorithm.generateRecommendations(requestData);
  
  // Guardar en la base de datos
  const savedRecommendations: Recommendation[] = [];
  
  for (const genRec of generatedRecs) {
    const recommendation = this.recommendationsRepository.create({
      message: genRec.message,
      priorityLevel: genRec.priorityLevel,
      trafficLightColor: genRec.trafficLightColor,
      category: genRec.category,
      parameters: genRec.parameters,
      userId,
      waterQuantityId: quantityId,
    });
    
    const saved = await this.recommendationsRepository.save(recommendation);
    savedRecommendations.push(saved);
  }
  
  return savedRecommendations;
}

// 4. Método GENERATE RECOMMENDATIONS FOR USER (CORREGIDO)
async generateRecommendationsForUser(userId: string): Promise<Recommendation[]> {
  try {
    const user = await this.usersService.findOne(userId);
    
    const requestData: RecommendationRequestData = {
      userId,
      householdSize: user.householdSize,
      reuseDisposition: user.reuseDisposition,
      climateConditions: user.climateConditions,
    };

    // Obtener recomendaciones generadas
    const generatedRecs = await this.recommendationAlgorithm.generateRecommendations(requestData);
    
    // Guardar en la base de datos
    const savedRecommendations: Recommendation[] = [];
    
    for (const genRec of generatedRecs) {
      const recommendation = this.recommendationsRepository.create({
        message: genRec.message,
        priorityLevel: genRec.priorityLevel,
        trafficLightColor: genRec.trafficLightColor,
        category: genRec.category,
        parameters: genRec.parameters,
        userId,
      });
      
      const saved = await this.recommendationsRepository.save(recommendation);
      savedRecommendations.push(saved);
    }
    
    return savedRecommendations;
  } catch (error) {
    throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
  }
}

  // 5. Método FIND ALL
  async findAll(filters: FilterRecommendationsDto) {
    const where: FindOptionsWhere<Recommendation> = {};
    const { page = 1, limit = 10, ...filterParams } = filters;

    if (filterParams.userId) where.userId = filterParams.userId;
    if (filterParams.isRead !== undefined) where.isRead = filterParams.isRead;
    if (filterParams.isApplied !== undefined) where.isApplied = filterParams.isApplied;
    
    if (filterParams.priorityLevels && filterParams.priorityLevels.length > 0) {
      where.priorityLevel = In(filterParams.priorityLevels);
    }
    
    if (filterParams.trafficLightColors && filterParams.trafficLightColors.length > 0) {
      where.trafficLightColor = In(filterParams.trafficLightColors);
    }
    
    if (filterParams.categories && filterParams.categories.length > 0) {
      where.category = In(filterParams.categories);
    }

    if (filterParams.startDate && filterParams.endDate) {
      where.createdAt = Between(new Date(filterParams.startDate), new Date(filterParams.endDate));
    }

    const [recommendations, total] = await this.recommendationsRepository.findAndCount({
      where,
      relations: ['user', 'waterQuality', 'waterQuantity'],
      order: { 
        createdAt: 'DESC',
        priorityLevel: 'ASC'
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: recommendations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 6. Método FIND ONE
  async findOne(id: string): Promise<Recommendation> {
    const recommendation = await this.recommendationsRepository.findOne({
      where: { id },
      relations: ['user', 'waterQuality', 'waterQuantity'],
    });

    if (!recommendation) {
      throw new NotFoundException(`Recomendación con ID ${id} no encontrada`);
    }

    return recommendation;
  }

  // 7. Método FIND BY USER
  async findByUser(userId: string, filters?: FilterRecommendationsDto): Promise<Recommendation[]> {
    const where: FindOptionsWhere<Recommendation> = { userId };
    
    if (filters?.priorityLevels && filters.priorityLevels.length > 0) {
      where.priorityLevel = In(filters.priorityLevels);
    }
    
    if (filters?.trafficLightColors && filters.trafficLightColors.length > 0) {
      where.trafficLightColor = In(filters.trafficLightColors);
    }
    
    if (filters?.categories && filters.categories.length > 0) {
      where.category = In(filters.categories);
    }
    
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;
    if (filters?.isApplied !== undefined) where.isApplied = filters.isApplied;

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.recommendationsRepository.find({
      where,
      relations: ['waterQuality', 'waterQuantity'],
      order: { 
        priorityLevel: 'ASC',
        createdAt: 'DESC'
      },
      take: filters?.limit || 50,
    });
  }

  // 8. Método UPDATE
  async update(id: string, updateDto: UpdateRecommendationDto): Promise<Recommendation> {
    const recommendation = await this.findOne(id);

    if (updateDto.isApplied && !recommendation.isApplied) {
      recommendation.appliedAt = new Date();
    }

    Object.assign(recommendation, updateDto);

    return this.recommendationsRepository.save(recommendation);
  }

  // 9. Método MARK AS READ
  async markAsRead(id: string): Promise<Recommendation> {
    const recommendation = await this.findOne(id);
    recommendation.isRead = true;
    return this.recommendationsRepository.save(recommendation);
  }

  // 10. Método MARK AS APPLIED
  async markAsApplied(id: string): Promise<Recommendation> {
    const recommendation = await this.findOne(id);
    recommendation.isApplied = true;
    recommendation.appliedAt = new Date();
    return this.recommendationsRepository.save(recommendation);
  }

  // 11. Método REMOVE
  async remove(id: string): Promise<void> {
    const result = await this.recommendationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Recomendación con ID ${id} no encontrada`);
    }
  }

  // 12. Método GET STATS
  async getStats(userId?: string): Promise<RecommendationStats> {
    const queryBuilder = this.recommendationsRepository.createQueryBuilder('rec');

    if (userId) {
      queryBuilder.where('rec.userId = :userId', { userId });
    }

    const stats = await queryBuilder
      .select([
        'COUNT(rec.id) as total',
        'SUM(CASE WHEN rec.isRead = true THEN 1 ELSE 0 END) as read',
        'SUM(CASE WHEN rec.isApplied = true THEN 1 ELSE 0 END) as applied',
        'SUM(CASE WHEN rec.priorityLevel = :critical THEN 1 ELSE 0 END) as critical',
        'SUM(CASE WHEN rec.priorityLevel = :high THEN 1 ELSE 0 END) as high',
        'SUM(CASE WHEN rec.priorityLevel = :medium THEN 1 ELSE 0 END) as medium',
        'SUM(CASE WHEN rec.priorityLevel = :low THEN 1 ELSE 0 END) as low',
        'SUM(CASE WHEN rec.trafficLightColor = :red THEN 1 ELSE 0 END) as red',
        'SUM(CASE WHEN rec.trafficLightColor = :yellow THEN 1 ELSE 0 END) as yellow',
        'SUM(CASE WHEN rec.trafficLightColor = :green THEN 1 ELSE 0 END) as green',
        'COUNT(DISTINCT rec.category) as categories',
      ])
      .setParameters({
        critical: 'critical',
        high: 'high',
        medium: 'medium',
        low: 'low',
        red: 'red',
        yellow: 'yellow',
        green: 'green',
      })
      .getRawOne();

    return {
      total: parseInt(stats.total) || 0,
      read: parseInt(stats.read) || 0,
      applied: parseInt(stats.applied) || 0,
      byPriority: {
        critical: parseInt(stats.critical) || 0,
        high: parseInt(stats.high) || 0,
        medium: parseInt(stats.medium) || 0,
        low: parseInt(stats.low) || 0,
      },
      byTrafficLight: {
        red: parseInt(stats.red) || 0,
        yellow: parseInt(stats.yellow) || 0,
        green: parseInt(stats.green) || 0,
      },
      categories: parseInt(stats.categories) || 0,
    };
  }

  // 13. Método GET RECOMMENDATION SUMMARY
  async getRecommendationSummary(userId?: string) {
    const stats = await this.getStats(userId);
    
    const recentRecommendations = await this.recommendationsRepository.find({
      where: userId ? { userId } : {},
      relations: ['waterQuality', 'waterQuantity'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // Calcular recomendaciones críticas no leídas
    const criticalUnread = await this.recommendationsRepository.count({
      where: {
        ...(userId && { userId }),
        priorityLevel: 'critical',
        isRead: false,
      },
    });

    return {
      summary: stats,
      recentRecommendations,
      criticalUnread,
      hasCriticalAlerts: criticalUnread > 0,
    };
  }

  // 14. Método GET ACTIVE RULES
  async getActiveRules() {
    return this.dataSource.query(`
      SELECT 
        id, name, description, 
        min_quantity_percentage, max_quantity_percentage,
        min_quality_irc, max_quality_irc,
        climate_conditions, reuse_dispositions,
        recommendation_text, priority_level,
        traffic_light_color, category, is_active,
        created_at, updated_at
      FROM recommendation_rules 
      WHERE is_active = true
      ORDER BY 
        CASE priority_level 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `);
  }

  // 15. Método FIND RULES BY CATEGORY
  async findRulesByCategory(category: string) {
    const allRules = await this.getActiveRules();
    return allRules.filter(rule => rule.category === category);
  }

  // 16. Método UPDATE RULE
  async updateRule(id: string, updateData: any) {
    // Actualizar directamente en la base de datos
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updateData)) {
      // Convertir camelCase a snake_case para la base de datos
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = $${fields.length + 2}`);
      values.push(value);
    }
    
    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }
    
    const query = `
      UPDATE recommendation_rules 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const result = await this.dataSource.query(query, [id, ...values]);
      
      if (result.length === 0) {
        throw new NotFoundException(`Regla con ID ${id} no encontrada`);
      }
      
      return result[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al actualizar la regla: ${errorMessage}`);
    }
  }

async generateRecommendationsPublic(data: {
  quantityPercentage?: number;
  qualityIrc?: number;
  climateConditions?: string[];
  reuseDisposition?: string;
  householdSize?: number;
}): Promise<any[]> {
  
  const requestData: RecommendationRequestData = {
    quantityPercentage: data.quantityPercentage,
    qualityIrc: data.qualityIrc,
    climateConditions: data.climateConditions,
    reuseDisposition: data.reuseDisposition,
    householdSize: data.householdSize,
  };

  // Obtener recomendaciones generadas
  const generatedRecs = await this.recommendationAlgorithm.generateRecommendations(requestData);
  
  // Convertir a formato de respuesta (sin guardar en DB)
  return generatedRecs.map(rec => ({
    message: rec.message,
    priorityLevel: rec.priorityLevel,
    trafficLightColor: rec.trafficLightColor,
    category: rec.category,
    parameters: rec.parameters,
    generatedAt: new Date().toISOString()
  }));
}

}