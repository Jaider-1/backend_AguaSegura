export type TrafficLightColor = 'green' | 'yellow' | 'red';

export interface RecommendationRule {
  parameter: string;
  min_value: number;
  max_value: number;
  condition: string;
  recommendation: string;
  severity: string;
}

export interface RecommendationResponse {
  trafficLight: TrafficLightColor;
  riskLevel: string;
  ircaValue: number;
  recommendations: string[];
  timestamp: string;
}
