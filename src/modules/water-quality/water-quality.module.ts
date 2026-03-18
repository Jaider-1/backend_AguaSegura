// src/modules/water-quality/water-quality.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterQualityService } from './water-quality.service';
import { WaterQualityController } from './water-quality.controller';
import { WaterQuality } from './entities/water-quality.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaterQuality, User])
  ],
  controllers: [WaterQualityController],
  providers: [WaterQualityService],
  exports: [WaterQualityService]
})
export class WaterQualityModule {}