// database/seeds/index.ts
import { DataSource } from 'typeorm';
import { seedRecommendations } from './recommendations.seed';

export async function runAllSeeds(dataSource: DataSource): Promise<void> {
  console.log(' Iniciando todos los seeders...');
  
  try {
    // Ejecutar seeders en orden
    await seedRecommendations(dataSource);
    
    // Aquí puedes agregar más seeders en el futuro
    // await seedUsers(dataSource);
    // await seedWaterQualityData(dataSource);
    
    console.log('Todos los seeders completados exitosamente');
  } catch (error) {
    console.error('Error ejecutando seeds:', error);
    throw error;
  }

  
  console.log('Todos los seeders completados exitosamente');
}