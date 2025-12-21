// src/modules/recommendations/recommendations.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  HttpCode, 
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam 
} from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { FilterRecommendationsDto } from './dto/filter-recommendations.dto';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  // ENDPOINTS PÚBLICOS

  @Get('rules')
  @ApiOperation({ summary: 'Obtener todas las reglas de recomendación activas' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de reglas de recomendación' 
  })
  async getRules() {
    return {
      success: true,
      data: await this.recommendationsService.getActiveRules()
    };
  }

  @Get('rules/category/:category')
  @ApiOperation({ summary: 'Obtener reglas por categoría' })
  @ApiParam({ 
    name: 'category', 
    description: 'Categoría de las reglas',
    type: String 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de reglas filtradas por categoría' 
  })
  async getRulesByCategory(@Param('category') category: string) {
    return {
      success: true,
      data: await this.recommendationsService.findRulesByCategory(category)
    };
  }

  @Post('generate/public')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar recomendaciones sin autenticación' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recomendaciones generadas exitosamente' 
  })
  async generatePublicRecommendations(
    @Body() body: {
      quantityPercentage?: number;
      qualityIrc?: number;
     
    }
  ) {
    const generatedRecs = await this.recommendationsService.generateRecommendationsPublic(body);
    
    return {
      success: true,
      data: generatedRecs
    };
  }

  @Post('simulate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Simular generación de recomendaciones' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recomendaciones simuladas generadas' 
  })
  async simulateRecommendations(
    @Body() simulateData: {
      scenario: 'critical' | 'low' | 'normal' | 'quality_issue' | 'family';
    }
  ) {
    const { recommendations, scenario, parameters } = await this.recommendationsService.simulateRecommendations(simulateData.scenario);
    
    return {
      success: true,
      data: recommendations,
      scenario,
      parameters
    };
  }

  // CRUD BÁSICO SIN AUTENTICACIÓN

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva recomendación' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recomendación creada exitosamente' 
  })
  async create(@Body() createRecommendationDto: CreateRecommendationDto) {
    return {
      success: true,
      data: await this.recommendationsService.create(createRecommendationDto)
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las recomendaciones' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de todas las recomendaciones' 
  })
  async findAll(@Query() filters: FilterRecommendationsDto) {
    return {
      success: true,
      data: await this.recommendationsService.findAll(filters)
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una recomendación por ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recomendación encontrada' 
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      data: await this.recommendationsService.findOne(id)
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una recomendación' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recomendación actualizada' 
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecommendationDto: UpdateRecommendationDto,
  ) {
    return {
      success: true,
      data: await this.recommendationsService.update(id, updateRecommendationDto)
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una recomendación' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recomendación eliminada' 
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.recommendationsService.remove(id);
    return {
      success: true,
      message: 'Recomendación eliminada exitosamente'
    };
  }

  @Post('generate/quality')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar recomendaciones a partir de datos de calidad de agua' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recomendaciones generadas exitosamente' 
  })
  async generateFromQuality(
    @Body() qualityData: { irca: number; measuredAt?: string }
  ) {
    return {
      success: true,
      data: await this.recommendationsService.generateFromQualityData(qualityData)
    };
  }

  @Post('generate/quantity')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar recomendaciones a partir de datos de cantidad de agua' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recomendaciones generadas exitosamente' 
  })
  async generateFromQuantity(
    @Body() quantityData: { level: number; measuredAt?: string }
  ) {
    return {
      success: true,
      data: await this.recommendationsService.generateFromQuantityData(quantityData)
    };
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Obtener estadísticas de recomendaciones' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Estadísticas de recomendaciones' 
  })
  async getStats() {
    return {
      success: true,
      data: await this.recommendationsService.getStats()
    };
  }
}