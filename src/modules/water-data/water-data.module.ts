import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterDataService } from './water-data.service';
import { WaterDataController } from './water-data.controller';
import { WaterQuantity } from '../water-quantity/entities/water-quantity.entity';
import { WaterQuality } from '../water-quality/entities/water-quality.entity';
import { WaterQuantityModule } from '../water-quantity/water-quantity.module';
import { WaterQualityModule } from '../water-quality/water-quality.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaterQuantity, WaterQuality]),
    forwardRef(() => WaterQuantityModule),
    forwardRef(() => WaterQualityModule),
    forwardRef(() => RecommendationsModule),
  ],
  controllers: [WaterDataController],
  providers: [WaterDataService],
  exports: [WaterDataService],
})
export class WaterDataModule {}
