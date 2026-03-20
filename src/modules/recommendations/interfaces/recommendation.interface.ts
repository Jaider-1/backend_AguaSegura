// src/modules/recommendations/interfaces/recommendation.interface.ts
export interface RecommendationRequestData {
  userId?: string;
  waterQualityId?: string;
  waterQuantityId?: string;
  quantityPercentage?: number;
  qualityIrc?: number;
  climateConditions?: string[];
  reuseDisposition?: string;
  inhabitants?: number;
  housingType?: string;
  // Compatibilidad hacia atrás
  householdSize?: number;
  currentDate?: Date;
}

export interface GeneratedRecommendation {
  message: string;
  priorityLevel: string;
  trafficLightColor: string;
  category: string;
  parameters?: Record<string, any>;
}

export interface RecommendationStats {
  total: number;
  read: number;
  applied: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byTrafficLight: {
    red: number;
    yellow: number;
    green: number;
  };
  categories: number;
}
