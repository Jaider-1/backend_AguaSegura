export type TrafficLightColor = 'green' | 'yellow' | 'red';

export interface RecommendationResponse {
  trafficLight: TrafficLightColor;
  riskLevel: string;
  ircaValue: number;
  recommendations: string[];
  timestamp: string;
}