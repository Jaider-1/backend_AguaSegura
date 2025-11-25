import axios from "axios";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { RecommendationRule } from "./interfaces/recommendation.interface";
import { RecommendationAlgorithm } from "./algorithms/recommendation.algorithm";
import { InjectRepository } from "@nestjs/typeorm";
import { Measurement } from "./entities/measurement.entity";
import { Repository } from "typeorm";

@Injectable()
export class RecommendationsService implements OnModuleInit {
  private rules: RecommendationRule[] = [];
  private algorithm: RecommendationAlgorithm;

  constructor(
    @InjectRepository(Measurement)
    private measurementRepo: Repository<Measurement>
  ) {}

  async onModuleInit() {
    this.rules = await this.loadGoogleSheet();
    this.algorithm = new RecommendationAlgorithm(this.rules);

    console.log(`📄 Reglas cargadas desde Google Sheets: ${this.rules.length}`);
  }

  updateRules(newRules: RecommendationRule[]) {
    this.rules = newRules;
    this.algorithm = new RecommendationAlgorithm(this.rules);
  }

  async generateRecommendations(data: {
    irca: number;
    ph?: number;
    turbidity?: number;
    temperature?: number;
  }) {
    // guardar en BD
    await this.measurementRepo.save({
      irca: data.irca,
      ph: data.ph,
      turbidity: data.turbidity,
      temperature: data.temperature,
    });

    return this.algorithm.calculateRecommendations(data);
  }

  // 🔥 Cargar reglas desde Google Sheets
  private async loadGoogleSheet(): Promise<RecommendationRule[]> {
    const sheetId = process.env.GSHEET_ID;
    const apiKey = process.env.GSHEET_API_KEY;
    const sheetName = process.env.GSHEET_SHEET || "Hoja1";

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

    const response = await axios.get(url);

    const rows = response.data.values;

    const headers = rows[0];
    const rules = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const ruleObj: any = {};

      headers.forEach((h, index) => {
        ruleObj[h] = row[index];
      });

      rules.push({
        parameter: ruleObj.parameter,
        min_value: parseFloat(ruleObj.min_value),
        max_value: parseFloat(ruleObj.max_value),
        condition: ruleObj.condition,
        recommendation: ruleObj.recommendation,
        severity: ruleObj.severity,
      });
    }

    

    return rules;
  }
}
