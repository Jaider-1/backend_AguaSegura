import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterQualityController } from './water-quality.controller';
import { WaterQualityService } from './water-quality.service';
import { WaterQuality } from './entities/water-quality.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WaterQuality])],
  controllers: [WaterQualityController],
  providers: [WaterQualityService],
  exports: [WaterQualityService],
})
export class WaterQualityModule {}