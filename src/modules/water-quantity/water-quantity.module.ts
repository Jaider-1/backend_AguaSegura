import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterQuantityController } from './water-quantity.controller';
import { WaterQuantityService } from './water-quantity.service';
import { WaterQuantity } from './entities/water-quantity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WaterQuantity])],
  controllers: [WaterQuantityController],
  providers: [WaterQuantityService],
  exports: [WaterQuantityService],
})
export class WaterQuantityModule {}