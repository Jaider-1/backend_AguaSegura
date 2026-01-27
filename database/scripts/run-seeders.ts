import { AppDataSource } from '../data-source';
import { seedRecommendations } from '../seeds/recommendations.seed';

async function runSeeds() {
  console.log('🌱 Iniciando proceso de seeding...');
  
  try {
    // 1. Conectar a la base de datos
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');
    
    // 2. Verificar si la tabla existe (opcional)
    const tableExists = await AppDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'recommendation_rules'
      )
    `);

    if (!tableExists[0].exists) {
      console.log('⚠️  La tabla recommendation_rules no existe.');
      console.log('💡 Ejecuta la aplicación primero para crear las tablas automáticamente.');
      process.exit(1);
    }
    
    // 3. Ejecutar seeds
    console.log('📝 Ejecutando seeds...');
    await seedRecommendations(AppDataSource);
    
    console.log('🎉 Seeds completados exitosamente!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  } finally {
    // Cerrar conexión
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Ejecutar
runSeeds();