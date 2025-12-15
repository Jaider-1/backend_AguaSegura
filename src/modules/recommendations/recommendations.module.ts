// src/modules/recommendations/recommendations.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // ← AÑADE ESTO
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { Recommendation } from './entities/recommendation.entity';
import { RecommendationAlgorithm } from './algorithms/recommendation.algorithm';
import { WaterQualityModule } from '../water-quality/water-quality.module';
import { WaterQuantityModule } from '../water-quantity/water-quantity.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module'; // ← AÑADE ESTO si existe

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation]),
    
    // Importar JwtModule para que AuthGuard funcione
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-key-dev',
      signOptions: { expiresIn: '1d' },
    }),
    
    // Importar otros módulos
    forwardRef(() => WaterQualityModule),
    forwardRef(() => WaterQuantityModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule), // ← Si tienes AuthModule
  ],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService, 
    RecommendationAlgorithm,
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}