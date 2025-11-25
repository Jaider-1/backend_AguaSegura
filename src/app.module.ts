// app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';

@Module({
  imports: [
    // 🔹 Carga variables de entorno .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🔹 Configuración de PostgreSQL desde .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true, // ⭐ Carga entidades automáticamente
      synchronize: true,
      logging: true,
    }),
    ScheduleModule.forRoot(),    // ← IMPORTANTE
    AuthModule,
    UsersModule,
    RecommendationsModule,
  ],
})
export class AppModule {}
