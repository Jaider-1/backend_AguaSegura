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

bootstrap();