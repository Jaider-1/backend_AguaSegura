import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { RecommendationRule, RecommendationResponse } from './interfaces/recommendation.interface';
import { RecommendationAlgorithm } from './algorithms/recommendation.algorithm';

@Injectable()
export class RecommendationsService implements OnModuleInit {
  private rules: RecommendationRule[] = [];
  private algorithm: RecommendationAlgorithm;

  async onModuleInit() {
    const file = path.join(process.cwd(), 'database', 'recommendations.csv');
    this.rules = await this.loadCsv(file);

    this.algorithm = new RecommendationAlgorithm(this.rules);

    console.log(`✅ Reglas cargadas: ${this.rules.length}`);
  }

  private loadCsv(filePath: string): Promise<RecommendationRule[]> {
    return new Promise((resolve, reject) => {
      const results: RecommendationRule[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push({
          parameter: data.parameter,
          min_value: parseFloat(data.min_value),
          max_value: parseFloat(data.max_value),
          condition: data.condition,
          recommendation: data.recommendation,
          severity: data.severity,
        }))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
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
