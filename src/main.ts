import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  try {
    // No es necesario crear la BD aquí, TypeORM lo hará automáticamente
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
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
    await app.listen(port, '0.0.0.0'); // <-- Escuchar en todas las interfaces
    
    
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();