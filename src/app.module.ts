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
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Recommendation } from './modules/recommendations/entities/recommendation.entity';
import { RecommendationRules } from './modules/recommendations/entities/recommendation-rules.entity';
import { FormResponsesModule } from './modules/form-responses/form-responses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'jaider123',
      database: process.env.DB_DATABASE || 'aguasegura',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    
    AuthModule,
    UsersModule,
    RecommendationsModule,
    WaterQuantityModule,
    WaterQualityModule,
    FormResponsesModule,
  ],
})
export class AppModule {}
