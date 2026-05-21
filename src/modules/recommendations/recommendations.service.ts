import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In, IsNull, SelectQueryBuilder } from 'typeorm';
import { DataSource } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { FilterRecommendationsDto } from './dto/filter-recommendations.dto';
import { RecommendationAlgorithm } from './algorithms/recommendation.algorithm';
import {
  RecommendationRequestData,
  RecommendationStats,
} from '../recommendations/interfaces/recommendation.interface';
import { UsersService } from '../users/users.service';
import { WaterQualityService } from '../water-quality/water-quality.service';
import { WaterQuantityService } from '../water-quantity/water-quantity.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Recommendation)
    private recommendationsRepository: Repository<Recommendation>,
    private dataSource: DataSource,
    private recommendationAlgorithm: RecommendationAlgorithm,
    private waterQualityService: WaterQualityService,
    private waterQuantityService: WaterQuantityService,
    private usersService: UsersService,
    private configService: ConfigService
  ) {}

  // Método CREATE simplificado
  async create(createDto: CreateRecommendationDto): Promise<Recommendation> {
    const recommendation = this.recommendationsRepository.create({
      ...createDto,
      expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : null,
    });

    return this.recommendationsRepository.save(recommendation);
  }

  // Método para generar desde datos de calidad
  async generateFromQualityData(data: {
    irca: number;
    measuredAt?: string;
  }): Promise<Recommendation[]> {
    const requestData = {
      qualityIrc: data.irca,
      measuredAt: data.measuredAt || new Date().toISOString(),
    };

    const generatedRecs = await this.recommendationAlgorithm.generateRecommendations(requestData);

    const savedRecommendations: Recommendation[] = [];

    for (const genRec of generatedRecs) {
      const recommendation = this.recommendationsRepository.create({
        message: genRec.message,
        priorityLevel: genRec.priorityLevel,
        trafficLightColor: genRec.trafficLightColor,
        category: genRec.category,
        parameters: genRec.parameters,
      });

      const saved = await this.recommendationsRepository.save(recommendation);
      savedRecommendations.push(saved);
    }

    return savedRecommendations;
  }

  // Método para generar desde datos de cantidad
  async generateFromQuantityData(data: {
    level: number;
    measuredAt?: string;
  }): Promise<Recommendation[]> {
    const requestData = {
      quantityPercentage: data.level,
      measuredAt: data.measuredAt || new Date().toISOString(),
    };

    const generatedRecs = await this.recommendationAlgorithm.generateRecommendations(requestData);

    const savedRecommendations: Recommendation[] = [];

    for (const genRec of generatedRecs) {
      const recommendation = this.recommendationsRepository.create({
        message: genRec.message,
        priorityLevel: genRec.priorityLevel,
        trafficLightColor: genRec.trafficLightColor,
        category: genRec.category,
        parameters: genRec.parameters,
      });

      const saved = await this.recommendationsRepository.save(recommendation);
      savedRecommendations.push(saved);
    }

    return savedRecommendations;
  }

  // Métodos CRUD básicos...
  async findAll(filters: FilterRecommendationsDto) {
    const where: FindOptionsWhere<Recommendation> = {};
    const { page = 1, limit = 10, ...filterParams } = filters;

    // Aplicar filtros...
    if (filterParams.priorityLevels?.length) {
      where.priorityLevel = In(filterParams.priorityLevels);
    }

    if (filterParams.trafficLightColors?.length) {
      where.trafficLightColor = In(filterParams.trafficLightColors);
    }

    if (filterParams.categories?.length) {
      where.category = In(filterParams.categories);
    }

    if (filterParams.startDate && filterParams.endDate) {
      where.createdAt = Between(new Date(filterParams.startDate), new Date(filterParams.endDate));
    }

    const [recommendations, total] = await this.recommendationsRepository.findAndCount({
      where,
      order: {
        priorityLevel: 'ASC',
        createdAt: 'DESC',
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

  async findOne(id: string, userId?: string): Promise<Recommendation> {
    const recommendation = await this.recommendationsRepository.findOne({
      where: { id, ...(userId ? { userId } : {}) },
    });

    if (!recommendation) {
      throw new NotFoundException(`Recomendación con ID ${id} no encontrada`);
    }

    return recommendation;
  }

  async update(id: string, updateDto: UpdateRecommendationDto): Promise<Recommendation> {
    const recommendation = await this.findOne(id);

    if (updateDto.isApplied && !recommendation.isApplied) {
      recommendation.appliedAt = new Date();
    }

    Object.assign(recommendation, updateDto);

    return this.recommendationsRepository.save(recommendation);
  }

  async remove(id: string): Promise<void> {
    const result = await this.recommendationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Recomendación con ID ${id} no encontrada`);
    }
  }

  // ============ MÉTODOS PARA USUARIOS REGISTRADOS ============

  async generateFromWaterQuality(qualityId: string, userId: string): Promise<Recommendation[]> {
    const qualityData = await this.waterQualityService.findAll(qualityId);
    const irca = this.recommendationAlgorithm.calculateIRCA(qualityData);

    const user = await this.usersService.findOne(userId);

    const requestData: RecommendationRequestData = {
      userId,
      waterQualityId: qualityId,
      qualityIrc: irca,
      householdSize: user.householdSize,
      reuseDisposition: user.reuseDisposition,
      climateConditions: user.climateConditions,
    };

    return this.saveRecommendations(requestData, { userId, waterQualityId: qualityId });
  }

  async generateFromWaterQuantity(quantityId: string, userId: string): Promise<Recommendation[]> {
    const quantityData = await this.waterQuantityService.findOne(quantityId);
    const user = await this.usersService.findOne(userId);

    const requestData: RecommendationRequestData = {
      userId,
      waterQuantityId: quantityId,
      quantityPercentage: quantityData.level,
      householdSize: user.householdSize,
      reuseDisposition: user.reuseDisposition,
      climateConditions: user.climateConditions,
    };

    return this.saveRecommendations(requestData, { userId, waterQuantityId: quantityId });
  }

  async generateRecommendationsForUser(userId: string): Promise<Recommendation[]> {
    const user = await this.usersService.findOne(userId);

    const requestData: RecommendationRequestData = {
      userId,
      householdSize: user.householdSize,
      reuseDisposition: user.reuseDisposition,
      climateConditions: user.climateConditions,
    };

    return this.saveRecommendations(requestData, { userId });
  }

  async findByUser(userId: string, filters?: FilterRecommendationsDto): Promise<Recommendation[]> {
    const where: FindOptionsWhere<Recommendation> = { userId };

    if (filters) {
      this.applyFiltersToWhere(where, filters);
    }

    return this.recommendationsRepository.find({
      where,
      relations: ['waterQuality', 'waterQuantity'],
      order: {
        priorityLevel: 'ASC',
        createdAt: 'DESC',
      },
      take: filters?.limit || 50,
    });
  }

  async markAsRead(id: string, userId?: string): Promise<Recommendation> {
    const recommendation = await this.findOne(id, userId);
    recommendation.isRead = true;
    return this.recommendationsRepository.save(recommendation);
  }

  async markAsApplied(id: string, userId?: string): Promise<Recommendation> {
    const recommendation = await this.findOne(id, userId);
    recommendation.isApplied = true;
    recommendation.appliedAt = new Date();
    return this.recommendationsRepository.save(recommendation);
  }

  // ============ MÉTODOS PARA INVITADOS (NO REGISTRADOS) ============

  async generateRecommendationsPublic(data: {
    quantityPercentage?: number;
    qualityIrc?: number;
    climateConditions?: string[];
    reuseDisposition?: string;
    householdSize?: number;
  }): Promise<
    Array<{
      message: string;
      priorityLevel: string;
      trafficLightColor: string;
      category: string;
      parameters: Record<string, unknown>;
      generatedAt: string;
      isForGuest: boolean;
    }>
  > {
    const requestData: RecommendationRequestData = {
      // No incluir userId para invitados
      quantityPercentage: data.quantityPercentage,
      qualityIrc: data.qualityIrc,
      climateConditions: data.climateConditions,
      reuseDisposition: data.reuseDisposition,
      householdSize: data.householdSize,
    };

    // Solo generar, no guardar en DB
    const generatedRecs = await this.recommendationAlgorithm.generateRecommendations(requestData);

    return generatedRecs.map((rec) => ({
      message: rec.message,
      priorityLevel: rec.priorityLevel,
      trafficLightColor: rec.trafficLightColor,
      category: rec.category,
      parameters: rec.parameters,
      generatedAt: new Date().toISOString(),
      isForGuest: true, // Marcar como para invitado
    }));
  }

  async simulateRecommendations(
    scenario: 'critical' | 'low' | 'normal' | 'quality_issue' | 'family'
  ): Promise<{
    recommendations: Array<{
      message: string;
      priorityLevel: string;
      trafficLightColor: string;
      category: string;
      parameters: Record<string, unknown>;
      generatedAt: string;
      isForGuest: boolean;
    }>;
    scenario: string;
    parameters: Record<string, unknown>;
  }> {
    let requestData: Partial<RecommendationRequestData>;

    switch (scenario) {
      case 'critical':
        requestData = { quantityPercentage: 10 }; // <15%
        break;
      case 'low':
        requestData = {
          quantityPercentage: 25,
          climateConditions: ['Sequía'],
          reuseDisposition: 'Dispuesto',
        };
        break;
      case 'quality_issue':
        requestData = { qualityIrc: 85 }; // >80%
        break;
      case 'family':
        requestData = { householdSize: 6 };
        break;
      default:
        requestData = { quantityPercentage: 50 }; // normal
    }

    const recommendations = await this.generateRecommendationsPublic(requestData);

    return {
      recommendations,
      scenario,
      parameters: requestData,
    };
  }

  // ============ MÉTODOS DE REGLAS Y ESTADÍSTICAS ============

  // Método para obtener TODAS las reglas (activas e inactivas)
  async getAllRules() {
    await this.ensureRecommendationRulesTable();

    return this.dataSource.query(`
      SELECT * FROM recommendation 
      ORDER BY 
        CASE
          WHEN priority_level = 'critical' THEN 1
          WHEN priority_level = 'high' THEN 2
          WHEN priority_level = 'medium' THEN 3
          WHEN priority_level = 'low' THEN 4
          ELSE 5
        END,
        id DESC
    `);
  }

  // Método existente para obtener solo reglas activas
  async getActiveRules() {
    await this.ensureRecommendationRulesTable();

    return this.dataSource.query(`
      SELECT * FROM recommendation 
      WHERE true 
      ORDER BY 
        CASE
          WHEN priority_level = 'critical' THEN 1
          WHEN priority_level = 'high' THEN 2
          WHEN priority_level = 'medium' THEN 3
          WHEN priority_level = 'low' THEN 4
          ELSE 5
        END,
        id DESC
    `);
  }

  async findRulesByCategory(category: string) {
    const allRules = await this.getAllRules();
    return allRules.filter((rule) => rule.category === category);
  }

  async updateRule(id: string, updateData: Record<string, unknown>) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = $${fields.length + 2}`);
      values.push(value);
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    const query = `
      UPDATE recommendation
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [id, ...values]);

    if (result.length === 0) {
      throw new NotFoundException(`Regla con ID ${id} no encontrada`);
    }

    return result[0];
  }

  async getStats(userId?: string): Promise<RecommendationStats> {
    const queryBuilder = this.recommendationsRepository.createQueryBuilder('rec');

    if (userId) {
      queryBuilder.where('rec.userId = :userId', { userId });
    } else {
      queryBuilder.where('rec.userId IS NULL'); // Solo recomendaciones de invitados
    }

    const stats = await this.calculateStatsFromQueryBuilder(queryBuilder);

    return stats;
  }

  async getRecommendationSummary(userId?: string) {
    const stats = await this.getStats(userId);

    const whereCondition: FindOptionsWhere<Recommendation> = {};
    if (userId) {
      whereCondition.userId = userId;
    } else {
      whereCondition.userId = IsNull();
    }

    const recentRecommendations = await this.recommendationsRepository.find({
      where: whereCondition,
      relations: ['waterQuality', 'waterQuantity'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const criticalUnread = await this.recommendationsRepository.count({
      where: {
        ...whereCondition,
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

  // ============ MÉTODOS PRIVADOS DE APOYO ============

  private async saveRecommendations(
    requestData: RecommendationRequestData,
    relationData: { userId?: string; waterQualityId?: string; waterQuantityId?: string }
  ): Promise<Recommendation[]> {
    const generatedRecs = await this.recommendationAlgorithm.generateRecommendations(requestData);

    const savedRecommendations: Recommendation[] = [];

    for (const genRec of generatedRecs) {
      const recommendation = this.recommendationsRepository.create({
        message: genRec.message,
        priorityLevel: genRec.priorityLevel,
        trafficLightColor: genRec.trafficLightColor,
        category: genRec.category,
        parameters: genRec.parameters,
        ...relationData,
      });

      const saved = await this.recommendationsRepository.save(recommendation);
      savedRecommendations.push(saved);
    }

    return savedRecommendations;
  }

  private applyFiltersToWhere(
    where: FindOptionsWhere<Recommendation>,
    filters: Partial<FilterRecommendationsDto>
  ): void {
    if (filters.userId) where.userId = filters.userId;
    if (filters.isRead !== undefined) where.isRead = filters.isRead;
    if (filters.isApplied !== undefined) where.isApplied = filters.isApplied;

    if (filters.priorityLevels?.length) {
      where.priorityLevel = In(filters.priorityLevels);
    }

    if (filters.trafficLightColors?.length) {
      where.trafficLightColor = In(filters.trafficLightColors);
    }

    if (filters.categories?.length) {
      where.category = In(filters.categories);
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    }
  }

  private async calculateStatsFromQueryBuilder(
    queryBuilder: SelectQueryBuilder<Recommendation>
  ): Promise<RecommendationStats> {
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

  private async ensureRecommendationRulesTable(): Promise<void> {
    try {
      await this.dataSource.query(`SELECT 1 FROM recommendation LIMIT 1`);
    } catch {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS recommendation (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

          -- Campos para reglas (opcionales)
          name VARCHAR(255),
          description TEXT,
          min_quantity_percentage DECIMAL(5,2),
          max_quantity_percentage DECIMAL(5,2),
          min_quality_irc DECIMAL(5,2),
          max_quality_irc DECIMAL(5,2),
          climate_conditions TEXT[],
          reuse_dispositions TEXT[],

          -- Campos compartidos por reglas y recomendaciones generadas
          recommendation_text TEXT NOT NULL,
          priority_level VARCHAR(20) NOT NULL CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
          traffic_light_color VARCHAR(10) NOT NULL CHECK (traffic_light_color IN ('green', 'yellow', 'red')),
          category VARCHAR(50) NOT NULL,

          -- Campos para recomendaciones generadas
          parameters JSONB,
          is_read BOOLEAN DEFAULT FALSE,
          is_applied BOOLEAN DEFAULT FALSE,
          applied_at TIMESTAMP,
          expires_at TIMESTAMP,
          user_id UUID,
          water_quality_id UUID,
          water_quantity_id UUID,

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Asegurar columnas para reglas + recomendaciones generadas (compatibilidad retroactiva)
    await this.dataSource.query(`
      ALTER TABLE recommendation
        ADD COLUMN IF NOT EXISTS recommendation_text TEXT,
        ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20),
        ADD COLUMN IF NOT EXISTS traffic_light_color VARCHAR(10),
        ADD COLUMN IF NOT EXISTS category VARCHAR(50),
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS min_quantity_percentage DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS max_quantity_percentage DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS min_quality_irc DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS max_quality_irc DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS climate_conditions TEXT[],
        ADD COLUMN IF NOT EXISTS reuse_dispositions TEXT[],
        ADD COLUMN IF NOT EXISTS parameters JSONB,
        ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_applied BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS user_id UUID,
        ADD COLUMN IF NOT EXISTS water_quality_id UUID,
        ADD COLUMN IF NOT EXISTS water_quantity_id UUID;
    `);

    await this.dataSource.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'recommendation' AND column_name = 'name'
        ) THEN
          EXECUTE 'ALTER TABLE recommendation ALTER COLUMN name DROP NOT NULL';
        END IF;
      END
      $$;
    `);

    // Migrar columnas legacy camelCase -> snake_case cuando existan
    await this.dataSource.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'recommendation' AND column_name = 'priorityLevel'
        ) THEN
          EXECUTE 'UPDATE recommendation SET priority_level = COALESCE(priority_level, "priorityLevel"::text)';
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'recommendation' AND column_name = 'trafficLightColor'
        ) THEN
          EXECUTE 'UPDATE recommendation SET traffic_light_color = COALESCE(traffic_light_color, "trafficLightColor"::text)';
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'recommendation' AND column_name = 'createdAt'
        ) THEN
          EXECUTE 'UPDATE recommendation SET created_at = COALESCE(created_at, "createdAt")';
        END IF;
      END
      $$;
    `);

    // Normalizar valores para evitar errores por datos legacy
    await this.dataSource.query(`
      UPDATE recommendation
      SET
        recommendation_text = COALESCE(recommendation_text, ''),
        priority_level = CASE
          WHEN priority_level IN ('critical', 'high', 'medium', 'low') THEN priority_level
          ELSE 'low'
        END,
        traffic_light_color = CASE
          WHEN traffic_light_color IN ('red', 'yellow', 'green') THEN traffic_light_color
          ELSE 'green'
        END,
        category = COALESCE(NULLIF(category, ''), 'general'),
        created_at = COALESCE(created_at, NOW()),
        updated_at = COALESCE(updated_at, NOW());
    `);
  }
  async getAllRecommendationsAndRules(filters: FilterRecommendationsDto) {
    const [recommendationsResult, allRules] = await Promise.all([
      this.findAll(filters),
      this.getAllRules(),
    ]);

    return {
      generatedRecommendations: recommendationsResult.data,
      recommendationRules: allRules,
      meta: {
        generated: recommendationsResult.meta,
        rules: {
          total: allRules.length,
          active: allRules.length,
          inactive: 0,
          categories: [...new Set(allRules.map((r) => r.category))],
        },
      },
    };
  }



   async onApplicationBootstrap() {
    // Ejecutar seeds
    const shouldRunSeeds = this.configService.get('RUN_SEEDS') !== 'false';
      if (shouldRunSeeds) {
      await this.runSeeds();
    }
  }

  private async runSeeds() {

    try {
      // Verificar si la tabla existe
      const tableExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'recommendation'
        );
      `);

      if (!tableExists[0].exists) {
        console.log('⚠️ La tabla recommendation no existe. Los seeds se ejecutarán cuando se cree la tabla.');
        return;
      }

      // Verificar si hay datos
      const count = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM recommendation WHERE name IS NOT NULL'
      );

      if (parseInt(count[0].count) === 0) {
        
        // Importar y ejecutar seeds
        const { seedRecommendations } = await import('../recommendations/entities/recommendations.seed');
        await seedRecommendations(this.dataSource);
        
      } 
    } catch (error) {
      console.error('Error ejecutando seeds:', error);
    }
  }



}

