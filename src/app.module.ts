import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { WaterQuantityModule } from './modules/water-quantity/water-quantity.module';
import { WaterQualityModule } from './modules/water-quality/water-quality.module';
import { User } from './modules/users/entities/user.entity';
import { WaterQuantity } from './modules/water-quantity/entities/water-quantity.entity';
import { WaterQuality } from './modules/water-quality/entities/water-quality.entity';
import configuration from './config/configuration';
import { Measurement } from './modules/recommendations/entities/measurement.entity';


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
        WaterQuantity, 
        WaterQuality,
        Measurement,
        __dirname + '/**/*.entity{.ts,.js}', // opcional pero recomendado
      ],

      synchronize: true,
      logging: true,
      
    }),

    AuthModule,
    UsersModule,
    RecommendationsModule,
    WaterQuantityModule,
    WaterQualityModule,
  ],
})
export class AppModule {}
