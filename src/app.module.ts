import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { User } from './modules/users/entities/user.entity';
import { Measurement } from './modules/recommendations/entities/measurement.entity';
import configuration from './config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: configuration().database.host,
      port: configuration().database.port,
      username: configuration().database.username,
      password: configuration().database.password,
      database: configuration().database.database,

      // 👇 AGREGAR TODAS LAS ENTIDADES AQUÍ
      entities: [
        User,
        Measurement,
        __dirname + '/**/*.entity{.ts,.js}', // opcional pero recomendado
      ],

      synchronize: true,
      logging: true,
    }),

    AuthModule,
    UsersModule,
    RecommendationsModule,
  ],
})
export class AppModule {}
