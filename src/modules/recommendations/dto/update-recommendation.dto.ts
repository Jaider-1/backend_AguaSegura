// src/modules/recommendations/dto/update-recommendation.dto.ts
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateRecommendationDto } from './create-recommendation.dto';

export class UpdateRecommendationDto extends PartialType(CreateRecommendationDto) {
    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    isRead?: boolean;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    isApplied?: boolean;
}

