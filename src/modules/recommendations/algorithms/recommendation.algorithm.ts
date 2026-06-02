import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RecommendationRequestData, GeneratedRecommendation } from '../interfaces/recommendation.interface';
import { Recommendation } from '../entities/recommendation.entity';

@Injectable()
export class RecommendationAlgorithm {
  constructor(private dataSource: DataSource) {}

  async generateRecommendations(data: RecommendationRequestData): Promise<GeneratedRecommendation[]> {
    const ruleRepository = this.dataSource.getRepository(Recommendation);
    const allRules = await ruleRepository.find({
      where: { userId: null },
      order: {
        priorityLevel: 'ASC',
        createdAt: 'DESC',
      },
    });
    const recommendations: GeneratedRecommendation[] = [];

    for (const rule of allRules) {
      if (this.isRuleApplicable(rule, data)) {
        recommendations.push({
          message: rule.message,
          priorityLevel: rule.priorityLevel,
          trafficLightColor: rule.trafficLightColor,
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
      rule.minQuantityPercentage !== null && rule.maxQuantityPercentage !== null;
    const hasQualityRange = rule.minQualityIrc !== null && rule.maxQualityIrc !== null;

    if (
      hasQuantityRange &&
      data.quantityPercentage !== undefined
    ) {
      if (
        data.quantityPercentage < parseFloat(rule.minQuantityPercentage) ||
        data.quantityPercentage > parseFloat(rule.maxQuantityPercentage)
      ) {
        return false;
      }
    }
    if (hasQuantityRange && data.quantityPercentage === undefined) {
      const minQty = parseFloat(rule.minQuantityPercentage);
      const maxQty = parseFloat(rule.maxQuantityPercentage);
      const defaultQuantity = 50;
      if (defaultQuantity < minQty || defaultQuantity > maxQty) return false;
    }

    if (
      hasQualityRange &&
      data.qualityIrc !== undefined
    ) {
      if (
        data.qualityIrc < parseFloat(rule.minQualityIrc) ||
        data.qualityIrc > parseFloat(rule.maxQualityIrc)
      ) {
        return false;
      }
    }
    if (hasQualityRange && data.qualityIrc === undefined) {
      const minQuality = parseFloat(rule.minQualityIrc);
      const maxQuality = parseFloat(rule.maxQualityIrc);
      const defaultQuality = 0;
      if (defaultQuality < minQuality || defaultQuality > maxQuality) return false;
    }

    if (rule.climateConditions && rule.climateConditions.length > 0) {
      if (!data.climateConditions?.length) return false;
      const ruleConditions = Array.isArray(rule.climateConditions)
        ? rule.climateConditions
        : String(rule.climateConditions)
            .split(',')
            .map((c: string) => c.trim());

      const hasMatchingCondition = data.climateConditions.some((condition) =>
        ruleConditions.includes(condition),
      );

      if (!hasMatchingCondition) return false;
    }

    if (rule.reuseDispositions && rule.reuseDispositions.length > 0) {
      if (!data.reuseDisposition) return false;
      const ruleDispositions = Array.isArray(rule.reuseDispositions)
        ? rule.reuseDispositions
        : String(rule.reuseDispositions)
            .split(',')
            .map((d: string) => d.trim());

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

    return true;
  }

  private extractRuleParameters(rule: any, data: RecommendationRequestData): Record<string, any> {
    const parameters: Record<string, any> = {};

    if (data.quantityPercentage !== undefined) {
      parameters.quantityPercentage = data.quantityPercentage;
      parameters.ruleQuantityMin = rule.minQuantityPercentage;
      parameters.ruleQuantityMax = rule.maxQuantityPercentage;
    }

    if (data.qualityIrc !== undefined) {
      parameters.qualityIrc = data.qualityIrc;
      parameters.ruleQualityMin = rule.minQualityIrc;
      parameters.ruleQualityMax = rule.maxQualityIrc;
    }

    if (data.climateConditions) {
      parameters.climateConditions = data.climateConditions;
      parameters.ruleClimateConditions = rule.climateConditions;
    }

    if (data.reuseDisposition) {
      parameters.reuseDisposition = data.reuseDisposition;
      parameters.ruleReuseDispositions = rule.reuseDispositions;
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
    const ruleRepository = this.dataSource.getRepository(Recommendation);
    return ruleRepository.find({
      where: { userId: null },
      order: {
        priorityLevel: 'ASC',
        createdAt: 'DESC',
      },
    });
  }
}
