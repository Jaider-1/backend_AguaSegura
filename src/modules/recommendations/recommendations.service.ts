import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

import { Measurement } from './entities/measurement.entity';
import { RecommendationRule, RecommendationResponse } from './interfaces/recommendation.interface';
import { RecommendationAlgorithm } from './algorithms/recommendation.algorithm';

@Injectable()
export class RecommendationsService implements OnModuleInit {
  private rules: RecommendationRule[] = [];
  private algorithm: RecommendationAlgorithm;

  constructor(
    @InjectRepository(Measurement)
    private measurementRepo: Repository<Measurement>,
  ) {}

  async onModuleInit() {
    const file = path.join(process.cwd(), 'database', 'recommendations.csv');
    this.rules = await this.loadCsv(file);
    this.algorithm = new RecommendationAlgorithm(this.rules);
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
    waterAmount?: number;
    }): Promise<RecommendationResponse> {
    
    // 1️⃣ Guardar valores en la BD (SIN recomendaciones)
    await this.measurementRepo.save({
      irca: data.irca,
      ph: data.ph,
      turbidity: data.turbidity,
      temperature: data.temperature,
      waterAmount: data.waterAmount,
    });

    // 2️⃣ Devolver el cálculo
    return this.algorithm.calculateRecommendations(data);
  }
}
