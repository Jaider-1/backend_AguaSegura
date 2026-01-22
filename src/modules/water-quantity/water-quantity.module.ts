// src/modules/water-quantity/water-quantity.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterQuantityService } from './water-quantity.service';
import { WaterQuantityController } from './water-quantity.controller';
import { WaterQuantity } from './entities/water-quantity.entity';
import { RecommendationsModule } from '../recommendations/recommendations.module'; // ← Importa RecommendationsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([WaterQuantity]),
    forwardRef(() => RecommendationsModule), // ← Importa RecommendationsModule también
  ],
  controllers: [WaterQuantityController],
  providers: [WaterQuantityService],
  exports: [WaterQuantityService],
})
export class WaterQuantityModule {}