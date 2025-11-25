import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
// Eliminar: import { JwtAuthGuard } from '../../common/guards/auth.guard';
// Eliminar: import { UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller('recommendations')
// Eliminar: @UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener recomendaciones basadas en calidad del agua' })
  @ApiResponse({ status: 200, description: 'Recomendaciones generadas' })
  async getRecommendations(
    @Query('irca') irca: number,
    @Query('ph') ph?: number,
    @Query('turbidity') turbidity?: number,
    @Query('temperature') temperature?: number,
    @Query('waterAmount') waterAmount?: number,
  ) {
    return this.recommendationsService.generateRecommendations({
      irca,
      ph,
      turbidity,
      temperature,
      waterAmount
    });
  }
}