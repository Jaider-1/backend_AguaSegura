import { RecommendationResponse, RecommendationRule, TrafficLightColor } from '../interfaces/recommendation.interface';

export class RecommendationAlgorithm {
  constructor(private rules: RecommendationRule[]) {}

  calculateRecommendations(data: {
    irca: number;
    ph?: number;
    turbidity?: number;
    temperature?: number;
  }): RecommendationResponse {
    const { irca } = data;

    const trafficLight = this.calculateTrafficLight(irca);
    const riskLevel = this.calculateRiskLevel(irca);

    const recommendations = this.applyRules(data);

    return {
      trafficLight,
      riskLevel,
      ircaValue: irca,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  }

  private calculateTrafficLight(irca: number): TrafficLightColor {
    if (irca <= 5) return 'green';
    if (irca <= 14) return 'yellow';
    return 'red';
  }

  private calculateRiskLevel(irca: number): string {
    if (irca <= 5) return 'Sin Riesgo';
    if (irca <= 14) return 'Bajo';
    if (irca <= 35) return 'Medio';
    if (irca <= 80) return 'Alto';
    return 'Inviable Sanitariamente';
  }

  private applyRules(data: any): string[] {
    const found: string[] = [];

    for (const rule of this.rules) {
      const parameter = rule.parameter;
      const value = data[parameter];

      if (value === undefined) continue;

      const min = Number(rule.min_value);
      const max = Number(rule.max_value);

      if (value >= min && value <= max) {
        found.push(rule.recommendation);
      }
    }

    return found;
  }
}
