import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function ensureDatabaseExists() {
  const dbName = process.env.DB_DATABASE || 'aguasegura';
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Jeyson1171',
    database: 'aguasegura', // Conectar a postgres default primero
  };

  const client = new Client(config);
  
  try {
    await client.connect();
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (result.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
    } 
  } catch (error) {
    
    throw error;
  } finally {
    await client.end();
  }
}

async function bootstrap() {
  
  try {
    // 1. Primero asegurar que la base de datos existe
    await ensureDatabaseExists();
    
    // 2. Crear la aplicación
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });
    
    // 3. Configurar validación global
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    // 4. Configurar CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || true,
      credentials: true,
    });
    
    // 5. Configurar Swagger
    const config = new DocumentBuilder()
      .setTitle('Aguasegura API')
      .setDescription('API para sistema de gestión de calidad del agua')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    // 6. Iniciar servidor
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    console.log(`✅ URL: http://localhost:${port}`);
    console.log(`📚 Swagger: http://localhost:${port}/api`);
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();