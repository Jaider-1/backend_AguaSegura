import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    this.logger.log('🔄 Verificando tablas tipo...');
    await this.ensureRecommendationRulesTable();
  }

  private async ensureRecommendationRulesTable(): Promise<void> {
    try {
      const tableExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'recommendation'
        )
      `);

      if (!tableExists[0].exists) {
        this.logger.warn('⚠️  Tabla tipo "recommendation" no existe');
        this.logger.warn('💡 Ejecuta: npm run seed:run para crear la tabla y datos');
      } else {
        // Verificar si tiene datos
        const count = await this.dataSource.query(
          `SELECT COUNT(*) as count FROM recommendation`
        );
        this.logger.log(`✅ Tabla tipo existe con ${count[0].count} reglas`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('❌ Error verificando tablas tipo:', errorMessage);
    }
  }
}