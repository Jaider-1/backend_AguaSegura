import { Injectable } from '@nestjs/common';
import { RecommendationResponse } from './interfaces/recommendation.interface';
import { RecommendationAlgorithm } from './algorithms/recommendation.algorithm';

@Injectable()
export class RecommendationsService {
  private algorithm: RecommendationAlgorithm;

  constructor() {
    this.algorithm = new RecommendationAlgorithm();
  }

  async generateRecommendations(data: {
    irca: number;
    ph?: number;
    turbidity?: number;
    temperature?: number;
  }): Promise<RecommendationResponse> {
    return this.algorithm.calculateRecommendations(data);
  }
}