import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecommendationRulesTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS recommendation_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        min_quantity_percentage DECIMAL(5,2),
        max_quantity_percentage DECIMAL(5,2),
        min_quality_irc DECIMAL(5,2),
        max_quality_irc DECIMAL(5,2),
        climate_conditions TEXT[],
        reuse_dispositions TEXT[],
        recommendation_text TEXT NOT NULL,
        priority_level VARCHAR(20) NOT NULL CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
        traffic_light_color VARCHAR(10) NOT NULL CHECK (traffic_light_color IN ('green', 'yellow', 'red')),
        category VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_rules_category ON recommendation_rules(category);
      CREATE INDEX IF NOT EXISTS idx_rules_priority ON recommendation_rules(priority_level);
      CREATE INDEX IF NOT EXISTS idx_rules_active ON recommendation_rules(is_active);
      CREATE INDEX IF NOT EXISTS idx_rules_quantity ON recommendation_rules(min_quantity_percentage, max_quantity_percentage);
      CREATE INDEX IF NOT EXISTS idx_rules_quality ON recommendation_rules(min_quality_irc, max_quality_irc);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS recommendation_rules CASCADE`);
  }
}