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
  UseGuards, 
  HttpCode, 
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import { FilterRecommendationsDto } from './dto/filter-recommendations.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  // 🔓 ENDPOINTS PÚBLICOS (sin autenticación)

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
      climateConditions?: string[];
      reuseDisposition?: string;
      householdSize?: number;
    }
  ) {
    // Crear recomendaciones sin usuario
    const requestData = {
      quantityPercentage: body.quantityPercentage,
      qualityIrc: body.qualityIrc,
      climateConditions: body.climateConditions,
      reuseDisposition: body.reuseDisposition,
      householdSize: body.householdSize,
    };

    const generatedRecs = await this.recommendationsService.generateRecommendationsPublic(requestData);
    
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
    let requestData;
    
    switch (simulateData.scenario) {
      case 'critical':
        requestData = { quantityPercentage: 10 }; // <15%
        break;
      case 'low':
        requestData = { 
          quantityPercentage: 25,
          climateConditions: ['Sequía'],
          reuseDisposition: 'Dispuesto'
        };
        break;
      case 'quality_issue':
        requestData = { qualityIrc: 85 }; // >80%
        break;
      case 'family':
        requestData = { householdSize: 6 };
        break;
      default:
        requestData = { quantityPercentage: 50 }; // normal
    }

    const recommendations = await this.recommendationsService.generateRecommendationsPublic(requestData);
    
    return {
      success: true,
      data: recommendations,
      scenario: simulateData.scenario,
      parameters: requestData
    };
  }

  // 🔐 ENDPOINTS PRIVADOS (requieren autenticación)

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Crear una nueva recomendación manualmente' })
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

  @Post('generate/quality/:qualityId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar recomendaciones a partir de datos de calidad de agua' })
  @ApiParam({ 
    name: 'qualityId', 
    description: 'ID de los datos de calidad de agua',
    type: String 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recomendaciones generadas exitosamente' 
  })
  async generateFromQuality(
    @Param('qualityId', ParseUUIDPipe) qualityId: string,
    @CurrentUser() user: User,
  ) {
    return {
      success: true,
      data: await this.recommendationsService.generateFromWaterQuality(qualityId, user?.id)
    };
  }

  @Post('generate/quantity/:quantityId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar recomendaciones a partir de datos de cantidad de agua' })
  @ApiParam({ 
    name: 'quantityId', 
    description: 'ID de los datos de cantidad de agua',
    type: String 
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Recomendaciones generadas exitosamente' 
  })
  async generateFromQuantity(
    @Param('quantityId', ParseUUIDPipe) quantityId: string,
    @CurrentUser() user: User,
  ) {
    return {
      success: true,
      data: await this.recommendationsService.generateFromWaterQuantity(quantityId, user?.id)
    };
  }

  @Get('my-recommendations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener las recomendaciones del usuario actual' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Recomendaciones del usuario' 
  })
  async findMyRecommendations(
    @CurrentUser() user: User,
    @Query() filters: FilterRecommendationsDto,
  ) {
    return {
      success: true,
      data: await this.recommendationsService.findByUser(user.id, filters)
    };
  }

  @Get('summary')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener resumen de recomendaciones del usuario actual' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Resumen de recomendaciones' 
  })
  async getSummary(@CurrentUser() user: User) {
    return {
      success: true,
      data: await this.recommendationsService.getRecommendationSummary(user.id)
    };
  }

  // ... resto de endpoints privados (mantienen UseGuards)
}