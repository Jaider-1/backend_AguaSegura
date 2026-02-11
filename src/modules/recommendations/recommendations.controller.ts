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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { FilterRecommendationsDto } from './dto/filter-recommendations.dto';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  // ENDPOINT PRINCIPAL MODIFICADO
  @Get()
  @ApiOperation({
    summary: 'Obtener todas las recomendaciones y reglas',
    description: 'Devuelve tanto las recomendaciones generadas como las reglas de recomendación',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de recomendaciones y reglas',
  })
  async findAll(@Query() filters: FilterRecommendationsDto) {
    // Obtener recomendaciones generadas
    const recommendationsResult = await this.recommendationsService.findAll(filters);

    // Obtener todas las reglas
    const allRules = await this.recommendationsService.getAllRules();

    return {
      success: true,
      data: {
        // Recomendaciones generadas
        generatedRecommendations: recommendationsResult.data,
        // Reglas de recomendación
        recommendationRules: allRules,
        // Metadatos combinados
        meta: {
          generated: {
            page: recommendationsResult.meta.page,
            limit: recommendationsResult.meta.limit,
            total: recommendationsResult.meta.total,
            totalPages: recommendationsResult.meta.totalPages,
          },
          rules: {
            total: allRules.length,
            active: allRules.filter((r) => r.is_active).length,
            inactive: allRules.filter((r) => !r.is_active).length,
            categories: [...new Set(allRules.map((r) => r.category))],
          },
        },
      },
    };
  }

  // ENDPOINTS PARA REGLAS DE RECOMENDACIÓN (mantener para acceso específico)

  @Get('rules')
  @ApiOperation({
    summary: 'Obtener reglas de recomendación',
    description:
      'Obtiene todas las reglas de recomendación. Usa el parámetro "active" para filtrar.',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filtrar por estado de la regla (true=activas, false=inactivas)',
    type: String,
    example: 'true',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reglas de recomendación',
  })
  async getRules(@Query('active') active?: string) {
    let rules;

    if (active === 'true') {
      rules = await this.recommendationsService.getActiveRules();
    } else if (active === 'false') {
      const allRules = await this.recommendationsService.getAllRules();
      rules = allRules.filter((rule) => rule.is_active === false);
    } else {
      rules = await this.recommendationsService.getAllRules();
    }

    return {
      success: true,
      data: rules,
      meta: {
        total: rules.length,
        activeCount: rules.filter((r) => r.is_active).length,
        inactiveCount: rules.filter((r) => !r.is_active).length,
      },
    };
  }

  @Get('rules/all')
  @ApiOperation({ summary: 'Obtener TODAS las reglas de recomendación (activas e inactivas)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista completa de todas las reglas de recomendación',
  })
  async getAllRules() {
    const rules = await this.recommendationsService.getAllRules();

    return {
      success: true,
      data: rules,
      meta: {
        total: rules.length,
        activeCount: rules.filter((r) => r.is_active).length,
        inactiveCount: rules.filter((r) => !r.is_active).length,
      },
    };
  }

  @Get('rules/active')
  @ApiOperation({ summary: 'Obtener solo las reglas de recomendación activas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reglas de recomendación activas',
  })
  async getActiveRules() {
    const rules = await this.recommendationsService.getActiveRules();

    return {
      success: true,
      data: rules,
      meta: {
        total: rules.length,
      },
    };
  }

  @Get('rules/category/:category')
  @ApiOperation({ summary: 'Obtener reglas por categoría' })
  @ApiParam({
    name: 'category',
    description: 'Categoría de las reglas',
    type: String,
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filtrar por estado de la regla',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de reglas filtradas por categoría',
  })
  async getRulesByCategory(@Param('category') category: string, @Query('active') active?: string) {
    let rules = await this.recommendationsService.findRulesByCategory(category);

    if (active === 'true') {
      rules = rules.filter((rule) => rule.is_active === true);
    } else if (active === 'false') {
      rules = rules.filter((rule) => rule.is_active === false);
    }

    return {
      success: true,
      data: rules,
      meta: {
        category,
        total: rules.length,
        activeCount: rules.filter((r) => r.is_active).length,
        inactiveCount: rules.filter((r) => !r.is_active).length,
      },
    };
  }

  // ENDPOINT ALTERNATIVO si quieres mantener el endpoint original de solo recomendaciones
  @Get('generated')
  @ApiOperation({ summary: 'Obtener solo las recomendaciones generadas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de recomendaciones generadas',
  })
  async findGeneratedRecommendations(@Query() filters: FilterRecommendationsDto) {
    return {
      success: true,
      data: await this.recommendationsService.findAll(filters),
    };
  }

  // Resto de los métodos permanecen igual...
  @Post('generate/public')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar recomendaciones sin autenticación' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recomendaciones generadas exitosamente',
  })
  async generatePublicRecommendations(
    @Body() body: { quantityPercentage?: number; qualityIrc?: number }
  ) {
    const generatedRecs = await this.recommendationsService.generateRecommendationsPublic(body);

    return {
      success: true,
      data: generatedRecs,
    };
  }

  @Post('simulate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Simular generación de recomendaciones' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recomendaciones simuladas generadas',
  })
  async simulateRecommendations(
    @Body() simulateData: { scenario: 'critical' | 'low' | 'normal' | 'quality_issue' | 'family' }
  ) {
    const { recommendations, scenario, parameters } =
      await this.recommendationsService.simulateRecommendations(simulateData.scenario);

    return {
      success: true,
      data: recommendations,
      scenario,
      parameters,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva recomendación' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recomendación creada exitosamente',
  })
  async create(@Body() createRecommendationDto: CreateRecommendationDto) {
    return {
      success: true,
      data: await this.recommendationsService.create(createRecommendationDto),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una recomendación por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recomendación encontrada',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      data: await this.recommendationsService.findOne(id),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una recomendación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recomendación actualizada',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecommendationDto: UpdateRecommendationDto
  ) {
    return {
      success: true,
      data: await this.recommendationsService.update(id, updateRecommendationDto),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una recomendación' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recomendación eliminada',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.recommendationsService.remove(id);
    return {
      success: true,
      message: 'Recomendación eliminada exitosamente',
    };
  }

  @Post('generate/quality')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar recomendaciones a partir de datos de calidad de agua' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recomendaciones generadas exitosamente',
  })
  async generateFromQuality(@Body() qualityData: { irca: number; measuredAt?: string }) {
    return {
      success: true,
      data: await this.recommendationsService.generateFromQualityData(qualityData),
    };
  }

  @Post('generate/quantity')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar recomendaciones a partir de datos de cantidad de agua' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recomendaciones generadas exitosamente',
  })
  async generateFromQuantity(@Body() quantityData: { level: number; measuredAt?: string }) {
    return {
      success: true,
      data: await this.recommendationsService.generateFromQuantityData(quantityData),
    };
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Obtener estadísticas de recomendaciones' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estadísticas de recomendaciones',
  })
  async getStats() {
    return {
      success: true,
      data: await this.recommendationsService.getStats(),
    };
  }
}
