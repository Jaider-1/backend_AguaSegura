// src/modules/recommendations/recommendations.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { Recommendation } from './entities/recommendation.entity'; // SOLO esta entidad
import { RecommendationAlgorithm } from './algorithms/recommendation.algorithm';
import { WaterQualityModule } from '../water-quality/water-quality.module';
import { WaterQuantityModule } from '../water-quantity/water-quantity.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
// o importa tu AuthModule si existe
import { AuthModule } from '../auth/auth.module';
import { RecommendationRules } from './entities/recommendation-rules.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation]), // SOLO Recommendation
    forwardRef(() => WaterQualityModule),
    forwardRef(() => WaterQuantityModule),
    forwardRef(() => UsersModule),
     JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
    TypeOrmModule.forFeature([Recommendation, RecommendationRules]),

  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, RecommendationAlgorithm],
  exports: [RecommendationsService, TypeOrmModule],
})
export class RecommendationsModule {}