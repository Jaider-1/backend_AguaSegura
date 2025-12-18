import { PartialType } from '@nestjs/swagger';
import { CreateWaterQuantityDto } from './create-water-quantity.dto';

export class UpdateWaterQuantityDto extends PartialType(CreateWaterQuantityDto) {}