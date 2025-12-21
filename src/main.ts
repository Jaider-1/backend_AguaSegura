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
    
    // Ejecutar migraciones pendientes
    await AppDataSource.runMigrations();
    
    // Ejecutar seeds
    await seedRecommendations(AppDataSource);
    
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
    
  } catch (error) {
    process.exit(1);
  }
}
bootstrap();