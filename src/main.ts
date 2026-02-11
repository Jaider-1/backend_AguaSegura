import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedRecommendations } from '../database/seeds/recommendations.seed';

async function bootstrap() {
  console.log('Iniciando Aguasegura Backend...');
  
  try {
    // 1. Primero crear la aplicación
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn'],
    });
    
    // 2. Obtener la conexión de TypeORM
    const dataSource = app.get(DataSource);
    
    // 3. Ejecutar seeds automáticamente (solo si no existen)
    console.log('Verificando seeds de recomendaciones...');
    try {
      const existingRules = await dataSource.query(
        'SELECT COUNT(*) as count FROM recommendation_rules'
      );
      
      if (parseInt(existingRules[0].count) === 0) {
        console.log('No hay reglas de recomendación. Ejecutando seeds...');
        await seedRecommendations(dataSource);
        console.log('Seeds ejecutados automáticamente');
      } else {
        console.log(`Ya existen ${existingRules[0].count} reglas de recomendación`);
      }
    } catch (seedError) {
      console.warn(' Error en seeds (puede ser normal):', seedError);
    }
    
    // 4. Configurar validación global
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // 5. Configurar CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });
    
    // 6. Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('Aguasegura API')
      .setDescription('API para sistema de gestión de calidad del agua')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    // 7. Iniciar servidor
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    console.log(`URL: http://localhost:${port}`);
    console.log(`Swagger: http://localhost:${port}/api`);
    
  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();
