import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Configuración de CORS
  app.enableCors();
  
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Aguasegura API')
    .setDescription('API para sistema de gestión de calidad del agua')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
  console.log('🚀 Servidor ejecutándose en http://localhost:3000');
  console.log('📚 Documentación API en http://localhost:3000/api');
}
bootstrap();