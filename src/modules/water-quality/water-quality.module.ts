// src/modules/water-quality/water-quality.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterQualityService } from './water-quality.service';
import { WaterQualityController } from './water-quality.controller';
import { WaterQuality } from './entities/water-quality.entity';
import { RecommendationsModule } from '../recommendations/recommendations.module'; // ← Importa RecommendationsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([WaterQuality]),
    forwardRef(() => RecommendationsModule), // ← Importa RecommendationsModule también
  ],
  controllers: [WaterQualityController],
  providers: [WaterQualityService],
  exports: [WaterQualityService],
})
export class WaterQualityModule {}