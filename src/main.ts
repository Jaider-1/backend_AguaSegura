import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Client } from 'pg';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
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
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || true,
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('Aguasegura API')
      .setDescription('API para sistema de gestión de calidad del agua')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
  } catch (error) {
    console.error('Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();
