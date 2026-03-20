// src/modules/recommendations/algorithms/recommendation.algorithm.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RecommendationRequestData, GeneratedRecommendation } from '../interfaces/recommendation.interface';

@Injectable()
export class RecommendationAlgorithm {
  constructor(private dataSource: DataSource) {}

  async generateRecommendations(data: RecommendationRequestData): Promise<GeneratedRecommendation[]> {
    // Consultar directamente la tabla recommendation en la base de datos
    const query = `
      SELECT * FROM recommendation
      WHERE true 
      ORDER BY 
        CASE priority_level 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        created_at DESC
    `;

    const allRules = await this.dataSource.query(query);

    const recommendations: GeneratedRecommendation[] = [];

    // Evaluar cada regla
    for (const rule of allRules) {
      if (this.isRuleApplicable(rule, data)) {
        recommendations.push({
          message: rule.recommendation_text,
          priorityLevel: rule.priority_level,
          trafficLightColor: rule.traffic_light_color,
          category: rule.category,
          parameters: this.extractRuleParameters(rule, data),
        });
      }
    }

    // Si no hay recomendaciones de reglas, agregar una general
    if (recommendations.length === 0) {
      recommendations.push({
        message: 'Mantener buenas prácticas de uso del agua y realizar monitoreo regular.',
        priorityLevel: 'low',
        trafficLightColor: 'green',
        category: 'mantenimiento',
        parameters: data,
      });
    }

    // Ordenar por prioridad (critical primero) y limitar a 3
    return this.sortRecommendations(recommendations).slice(0, 3);
  }

  private isRuleApplicable(rule: any, data: RecommendationRequestData): boolean {
    // Verificar cantidad de agua
    if (rule.min_quantity_percentage !== null && rule.max_quantity_percentage !== null) {
      if (data.quantityPercentage === undefined) return false;
      if (data.quantityPercentage < parseFloat(rule.min_quantity_percentage) || 
          data.quantityPercentage > parseFloat(rule.max_quantity_percentage)) {
        return false;
      }
    }

    // Verificar calidad del agua (IRCA)
    if (rule.min_quality_irc !== null && rule.max_quality_irc !== null) {
      if (data.qualityIrc === undefined) return false;
      if (data.qualityIrc < parseFloat(rule.min_quality_irc) || 
          data.qualityIrc > parseFloat(rule.max_quality_irc)) {
        return false;
      }
    }

    // Verificar condiciones climáticas
    if (rule.climate_conditions && rule.climate_conditions.length > 0) {
      if (!data.climateConditions || data.climateConditions.length === 0) return false;
      
      // Convertir string de array a array real
      const ruleConditions = rule.climate_conditions.split(',').map((c: string) => c.trim());
      const hasMatchingCondition = data.climateConditions.some(condition => 
        ruleConditions.includes(condition)
      );
      if (!hasMatchingCondition) return false;
    }

    // Verificar disposición al reuso
    if (rule.reuse_dispositions && rule.reuse_dispositions.length > 0) {
      if (!data.reuseDisposition) return false;
      
      // Convertir string de array a array real
      const ruleDispositions = rule.reuse_dispositions.split(',').map((d: string) => d.trim());
      if (!ruleDispositions.includes(data.reuseDisposition)) return false;
    }

    // Verificar habitantes (si la regla lo define)
    if (rule.habitantes !== null && rule.habitantes !== undefined) {
      const effectiveInhabitants = data.inhabitants ?? data.householdSize;
      if (effectiveInhabitants === undefined) return false;
      if (effectiveInhabitants !== parseInt(rule.habitantes, 10)) return false;
    }

    // Verificar tipo de vivienda (si la regla lo define)
    if (rule.tipo_vivienda !== null && rule.tipo_vivienda !== undefined && rule.tipo_vivienda !== '') {
      if (!data.housingType) return false;
      if (String(data.housingType).toLowerCase() !== String(rule.tipo_vivienda).toLowerCase()) {
        return false;
      }
    }

    // Reglas sin condiciones específicas (siempre aplican)
    const hasSpecificConditions = 
      rule.min_quantity_percentage !== null ||
      rule.max_quantity_percentage !== null ||
      rule.min_quality_irc !== null ||
      rule.max_quality_irc !== null ||
      (rule.climate_conditions && rule.climate_conditions.length > 0) ||
      (rule.reuse_dispositions && rule.reuse_dispositions.length > 0) ||
      rule.habitantes !== null ||
      (rule.tipo_vivienda !== null && rule.tipo_vivienda !== undefined && rule.tipo_vivienda !== '');

    return !hasSpecificConditions || true;
  }

  private extractRuleParameters(rule: any, data: RecommendationRequestData): Record<string, any> {
    const parameters: Record<string, any> = {};

    if (data.quantityPercentage !== undefined) {
      parameters.quantityPercentage = data.quantityPercentage;
      parameters.ruleQuantityMin = rule.min_quantity_percentage;
      parameters.ruleQuantityMax = rule.max_quantity_percentage;
    }

    if (data.qualityIrc !== undefined) {
      parameters.qualityIrc = data.qualityIrc;
      parameters.ruleQualityMin = rule.min_quality_irc;
      parameters.ruleQualityMax = rule.max_quality_irc;
    }

    if (data.climateConditions) {
      parameters.climateConditions = data.climateConditions;
      parameters.ruleClimateConditions = rule.climate_conditions;
    }

    if (data.reuseDisposition) {
      parameters.reuseDisposition = data.reuseDisposition;
      parameters.ruleReuseDispositions = rule.reuse_dispositions;
    }

    const effectiveInhabitants = data.inhabitants ?? data.householdSize;
    if (effectiveInhabitants !== undefined) {
      parameters.inhabitants = effectiveInhabitants;
      parameters.householdSize = effectiveInhabitants;
    }

    if (data.housingType) {
      parameters.housingType = data.housingType;
    }

    return parameters;
  }

  private sortRecommendations(recommendations: GeneratedRecommendation[]): GeneratedRecommendation[] {
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    
    return recommendations.sort((a, b) => {
      return priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel];
    });
  }

  calculateIRCA(qualityData: any): number {
    let irca = 0;
    
    if (qualityData.ph) {
      if (qualityData.ph < 6.5 || qualityData.ph > 8.5) irca += 20;
    }
    
    if (qualityData.turbidity && qualityData.turbidity > 5) {
      irca += Math.min(30, (qualityData.turbidity - 5) * 3);
    }
    
    if (qualityData.temperature) {
      if (qualityData.temperature < 15 || qualityData.temperature > 25) irca += 15;
    }
    
    if (qualityData.conductivity && qualityData.conductivity > 1500) {
      irca += Math.min(25, (qualityData.conductivity - 1500) / 60);
    }
    
    if (qualityData.dissolvedOxygen && qualityData.dissolvedOxygen < 5) {
      irca += 10;
    }
    
    return Math.min(100, irca);
  }

  // Método para obtener reglas directamente (para admin)
  async getRules(): Promise<any[]> {
    return this.dataSource.query(`
      SELECT 
        id, name, description, 
        min_quantity_percentage, max_quantity_percentage,
        min_quality_irc, max_quality_irc,
        climate_conditions, reuse_dispositions,
        habitantes, tipo_vivienda,
        recommendation_text, priority_level,
        traffic_light_color, category,
        created_at, updated_at
      FROM recommendation 
      WHERE true
      ORDER BY 
        CASE priority_level 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `);
  }
}
