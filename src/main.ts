import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppDataSource } from '../database/data-source';
import { seedRecommendations } from '../database/seeds/recommendations.seed';

async function bootstrap() {
  // Ejecutar migraciones antes de iniciar la app
  console.log('📊 Conectando a la base de datos...');
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Base de datos conectada');
    
    // Ejecutar migraciones pendientes
    console.log('🔄 Ejecutando migraciones...');
    await AppDataSource.runMigrations();
    console.log('✅ Migraciones completadas');
    
    // Ejecutar seeds
    console.log('🌱 Ejecutando seeds...');
    await seedRecommendations(AppDataSource);
    console.log('✅ Seeds completados');
    
    // Iniciar aplicación NestJS
    const app = await NestFactory.create(AppModule);
    
    // Configuración de validación global
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // Configuración de CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });
    
    // Configuración de Swagger
    const config = new DocumentBuilder()
      .setTitle('Aguasegura API')
      .setDescription('API para sistema de gestión de calidad del agua')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Servidor ejecutándose en: http://localhost:${port}`);
    console.log('📚 Documentación API en http://localhost:' + port + '/api');
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}
bootstrap();