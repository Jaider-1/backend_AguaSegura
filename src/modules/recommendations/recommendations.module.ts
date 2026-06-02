// src/modules/recommendations/recommendations.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { Recommendation } from './entities/recommendation.entity';
import { RecommendationAlgorithm } from './algorithms/recommendation.algorithm';
import { WaterQualityModule } from '../water-quality/water-quality.module';
import { WaterQuantityModule } from '../water-quantity/water-quantity.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation]),
    ConfigModule,
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('jwt.secret', '');
        if (!secret) {
          throw new Error('JWT_SECRET is required to initialize RecommendationsModule.');
        }

        return {
          secret,
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    
    forwardRef(() => WaterQualityModule),
    forwardRef(() => WaterQuantityModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService, 
    RecommendationAlgorithm,
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}