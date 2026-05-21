import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RecommendationRequestData, GeneratedRecommendation } from '../interfaces/recommendation.interface';

@Injectable()
export class RecommendationAlgorithm {
  constructor(private dataSource: DataSource) {}

  async generateRecommendations(data: RecommendationRequestData): Promise<GeneratedRecommendation[]> {
    const query = `
      SELECT * FROM recommendation
      WHERE name IS NOT NULL
      ORDER BY
        CASE
          WHEN priority_level = 'critical' THEN 1
          WHEN priority_level = 'high' THEN 2
          WHEN priority_level = 'medium' THEN 3
          WHEN priority_level = 'low' THEN 4
          ELSE 5
        END,
        id DESC
    `;

    const allRules = await this.dataSource.query(query);
    const recommendations: GeneratedRecommendation[] = [];

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

    if (recommendations.length === 0) {
      recommendations.push({
        message: 'Mantener buenas practicas de uso del agua y realizar monitoreo regular.',
        priorityLevel: 'low',
        trafficLightColor: 'green',
        category: 'mantenimiento',
        parameters: data,
      });
    }

    return this.sortRecommendations(recommendations).slice(0, 3);
  }

  private isRuleApplicable(rule: any, data: RecommendationRequestData): boolean {
    const hasQuantityRange =
      rule.min_quantity_percentage !== null && rule.max_quantity_percentage !== null;
    const hasQualityRange = rule.min_quality_irc !== null && rule.max_quality_irc !== null;

    if (
      hasQuantityRange &&
      data.quantityPercentage !== undefined
    ) {
      if (
        data.quantityPercentage < parseFloat(rule.min_quantity_percentage) ||
        data.quantityPercentage > parseFloat(rule.max_quantity_percentage)
      ) {
        return false;
      }
    }
    if (hasQuantityRange && data.quantityPercentage === undefined) {
      const minQty = parseFloat(rule.min_quantity_percentage);
      const maxQty = parseFloat(rule.max_quantity_percentage);
      const defaultQuantity = 50;
      if (defaultQuantity < minQty || defaultQuantity > maxQty) return false;
    }

    if (
      hasQualityRange &&
      data.qualityIrc !== undefined
    ) {
      if (
        data.qualityIrc < parseFloat(rule.min_quality_irc) ||
        data.qualityIrc > parseFloat(rule.max_quality_irc)
      ) {
        return false;
      }
    }
    if (hasQualityRange && data.qualityIrc === undefined) {
      const minQuality = parseFloat(rule.min_quality_irc);
      const maxQuality = parseFloat(rule.max_quality_irc);
      const defaultQuality = 0;
      if (defaultQuality < minQuality || defaultQuality > maxQuality) return false;
    }

    if (rule.climate_conditions && rule.climate_conditions.length > 0) {
      if (!data.climateConditions?.length) return false;
      const ruleConditions = Array.isArray(rule.climate_conditions)
        ? rule.climate_conditions
        : String(rule.climate_conditions)
            .split(',')
            .map((c: string) => c.trim());

      const hasMatchingCondition = data.climateConditions.some((condition) =>
        ruleConditions.includes(condition),
      );

      if (!hasMatchingCondition) return false;
    }

    if (rule.reuse_dispositions && rule.reuse_dispositions.length > 0) {
      if (!data.reuseDisposition) return false;
      const ruleDispositions = Array.isArray(rule.reuse_dispositions)
        ? rule.reuse_dispositions
        : String(rule.reuse_dispositions)
            .split(',')
            .map((d: string) => d.trim());

      if (!ruleDispositions.includes(data.reuseDisposition)) return false;
    }

    return true;
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

    if (data.householdSize !== undefined) {
      parameters.householdSize = data.householdSize;
    }

    return parameters;
  }

  private sortRecommendations(recommendations: GeneratedRecommendation[]): GeneratedRecommendation[] {
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };

    return recommendations.sort((a, b) => priorityOrder[a.priorityLevel] - priorityOrder[b.priorityLevel]);
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

  async getRules(): Promise<any[]> {
    return this.dataSource.query(`
      SELECT
        id, name, description,
        min_quantity_percentage, max_quantity_percentage,
        min_quality_irc, max_quality_irc,
        climate_conditions, reuse_dispositions,
        recommendation_text, priority_level,
        traffic_light_color, category,
        created_at, updated_at
      FROM recommendation
      WHERE name IS NOT NULL
      ORDER BY
        CASE
          WHEN priority_level = 'critical' THEN 1
          WHEN priority_level = 'high' THEN 2
          WHEN priority_level = 'medium' THEN 3
          WHEN priority_level = 'low' THEN 4
          ELSE 5
        END
    `);
  }
}
