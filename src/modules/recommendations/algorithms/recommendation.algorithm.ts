import { RecommendationResponse, TrafficLightColor } from '../interfaces/recommendation.interface';

export class RecommendationAlgorithm {
  
  calculateRecommendations(data: {
    irca: number;
    ph?: number;
    turbidity?: number;
    temperature?: number;
  }): RecommendationResponse {
    const { irca, ph, turbidity, temperature } = data;
    
    // Determinar color del semáforo basado en IRCA
    const trafficLight = this.calculateTrafficLight(irca);
    
    // Generar recomendaciones específicas
    const recommendations = this.generateSpecificRecommendations(irca, ph, turbidity, temperature);
    
    // Calcular nivel de riesgo
    const riskLevel = this.calculateRiskLevel(irca);
    
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

  private generateSpecificRecommendations(
    irca: number,
    ph?: number,
    turbidity?: number,
    temperature?: number
  ): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en IRCA
    if (irca <= 5) {
      recommendations.push('✅ El agua es apta para consumo humano');
      recommendations.push('💧 Continuar con el control y vigilancia regular');
    } else if (irca <= 14) {
      recommendations.push('⚠️ Agua susceptible de mejoramiento');
      recommendations.push('🔍 Realizar análisis más frecuentes');
      recommendations.push('💡 Considerar métodos de purificación adicionales');
    } else if (irca <= 35) {
      recommendations.push('🚫 Agua no apta para consumo humano');
      recommendations.push('🔬 Contactar con autoridad sanitaria local');
      recommendations.push('💧 Hervir el agua antes de consumir');
    } else if (irca <= 80) {
      recommendations.push('🚨 Agua no apta para consumo humano - ALTO RIESGO');
      recommendations.push('📞 Notificar a autoridades sanitarias inmediatamente');
      recommendations.push('💧 Usar solo agua embotellada o hervida');
    } else {
      recommendations.push('🔥 AGUA INVIABLE SANITARIAMENTE');
      recommendations.push('🚑 Contactar urgentemente con autoridades');
      recommendations.push('💧 No usar para ningún tipo de consumo');
    }

    // Recomendaciones específicas por parámetro
    if (ph !== undefined) {
      if (ph < 6.5) {
        recommendations.push('📉 pH bajo: Considerar neutralización');
      } else if (ph > 8.5) {
        recommendations.push('📈 pH alto: Revisar tratamiento químico');
      }
    }

    if (turbidity !== undefined && turbidity > 5) {
      recommendations.push('🌊 Alta turbidez: Mejorar filtración');
    }

    if (temperature !== undefined && temperature > 25) {
      recommendations.push('🌡️ Temperatura elevada: Riesgo de proliferación bacteriana');
    }

    return recommendations;
  }
}