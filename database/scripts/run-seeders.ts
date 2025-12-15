// database/scripts/run-seeders.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { runAllSeeds } from '../seeds/index';

async function bootstrap() {
  console.log('🌱 Iniciando proceso de seeding...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await dataSource.initialize();
    console.log('📊 Conectado a la base de datos');
    
    // PRIMERO: Crear la tabla si no existe
    await createRecommendationRulesTable(dataSource);
    
    // SEGUNDO: Ejecutar seeders
    await runAllSeeds(dataSource);
    
    console.log('✅ Proceso de seeding completado');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    await app.close();
    process.exit(1);
  }
}

async function createRecommendationRulesTable(dataSource: DataSource): Promise<void> {
  console.log('🔍 Verificando tabla recommendation_rules...');
  
  const tableExists = await dataSource.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'recommendation_rules'
    )
  `);

  if (!tableExists[0].exists) {
    console.log('📝 Creando tabla recommendation_rules...');
    
    await dataSource.query(`
      CREATE TABLE recommendation_rules (
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
      )
    `);

    // Crear índices
    await dataSource.query(`CREATE INDEX idx_rules_category ON recommendation_rules(category)`);
    await dataSource.query(`CREATE INDEX idx_rules_priority ON recommendation_rules(priority_level)`);
    await dataSource.query(`CREATE INDEX idx_rules_active ON recommendation_rules(is_active)`);
    await dataSource.query(`CREATE INDEX idx_rules_quantity ON recommendation_rules(min_quantity_percentage, max_quantity_percentage)`);
    await dataSource.query(`CREATE INDEX idx_rules_quality ON recommendation_rules(min_quality_irc, max_quality_irc)`);
    
    console.log('✅ Tabla recommendation_rules creada');
  } else {
    console.log('✅ Tabla recommendation_rules ya existe');
  }
}

bootstrap();