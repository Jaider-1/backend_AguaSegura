import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { RecommendationRule } from "./interfaces/recommendation.interface";
import { RecommendationAlgorithm } from "./algorithms/recommendation.algorithm";

@Injectable()
export class RecommendationsService implements OnModuleInit {
  private rules: RecommendationRule[] = [];
  private lastSnapshot: string = ""; // 🔹 para detectar cambios
  private algorithm: RecommendationAlgorithm;

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    await this.loadRulesFromGoogleSheets();
    this.algorithm = new RecommendationAlgorithm(this.rules);

    console.log(`✅ Reglas iniciales cargadas: ${this.rules.length}`);
  }

  // 🔥 Cargar Google Sheets
  private async loadRulesFromGoogleSheets(): Promise<void> {
    const sheetId = process.env.GSHEET_ID;
    const apiKey = process.env.GSHEET_API_KEY;
    const sheetName = process.env.GSHEET_SHEET;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const rows = response.data.values;

    if (!rows || rows.length < 2) return;

    const [headers, ...data] = rows;

    this.rules = data.map((row) => {
      const obj: any = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return {
        parameter: obj.parameter,
        min_value: Number(obj.min_value),
        max_value: Number(obj.max_value),
        condition: obj.condition,
        recommendation: obj.recommendation,
        severity: obj.severity,
      };
    });

    this.algorithm = new RecommendationAlgorithm(this.rules);
    console.log(`🔄 Reglas actualizadas. Total: ${this.rules.length}`);
  }

  // 🔄 CRON JOB: cada minuto revisa si hubo cambios
  @Cron("*/5 * * * * *") // Cada 5 segundos
  async checkForUpdates() {
    try {
      console.log(
        `⏳ [${new Date().toISOString()}] Revisando cambios en Google Sheets...`
      );

      const sheetId = process.env.GSHEET_ID;
      const apiKey = process.env.GSHEET_API_KEY;
      const sheetName = process.env.GSHEET_SHEET;

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

      const response = await firstValueFrom(this.httpService.get(url));

      const newSnapshot = JSON.stringify(response.data.values);

      if (this.lastSnapshot === "") {
        this.lastSnapshot = newSnapshot;
        console.log("📌 Snapshot inicial guardado.");
        return;
      }

      if (newSnapshot !== this.lastSnapshot) {
        console.log("⚠️ ¡Google Sheets cambió! Recargando reglas...");
        this.lastSnapshot = newSnapshot;
        await this.loadRulesFromGoogleSheets();
      } else {
        console.log("✔ Sin cambios.");
      }
    } catch (e) {
      console.error("❌ Error revisando Google Sheets:", e.message);
    }
  }

  async generateRecommendations(data: any) {
    return this.algorithm.calculateRecommendations(data);
  }
}
