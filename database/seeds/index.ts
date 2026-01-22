// database/seeds/index.ts
import { DataSource } from 'typeorm';
import { seedRecommendations } from './recommendations.seed';

export async function runAllSeeds(dataSource: DataSource): Promise<void> {
  console.log('🚀 Iniciando todos los seeders...');
  
  // Ejecutar seeders en orden
  await seedRecommendations(dataSource);
  
  // Aquí puedes agregar más seeders si los necesitas
  // await seedUsers(dataSource);
  // await seedWaterQualityData(dataSource);
  
  console.log('🎉 Todos los seeders completados exitosamente');
}