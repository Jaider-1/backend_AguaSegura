import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  Put, 
  Delete, 
  HttpCode, 
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { FormResponsesService, UserStats } from './form-responses.service';
import { CreateFormResponseDto } from './dto/create-form-response.dto';
import { UpdateFormResponseDto } from './dto/update-form-response.dto';


@ApiTags('form-responses')
@Controller('form-responses')
export class FormResponsesController {
  constructor(private readonly formResponsesService: FormResponsesService) {}

  // ========== CREATE ==========
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nueva respuesta de formulario',
    description: 'Crea una nueva respuesta con todos los datos del formulario' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Respuesta creada exitosamente',
    type: CreateFormResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o faltantes' 
  })
  @ApiBody({ type: CreateFormResponseDto })
  async create(@Body() createDto: CreateFormResponseDto) {
    return this.formResponsesService.create(createDto);
  }

  // ========== GET ALL ==========
  @Get()
  @ApiOperation({ 
    summary: 'Obtener todas las respuestas',
    description: 'Obtiene todas las respuestas, opcionalmente filtradas por usuario' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de respuestas obtenida exitosamente' 
  })
  @ApiQuery({ 
    name: 'userId', 
    required: false, 
    description: 'Filtrar respuestas por ID de usuario' 
  })
  async findAll(@Query('userId') userId?: string) {
    return this.formResponsesService.findAll(userId);
  }

  // ========== GET BY ID ==========
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener respuesta por ID',
    description: 'Obtiene una respuesta específica por su ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta encontrada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Respuesta no encontrada' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la respuesta' 
  })
  async findOne(@Param('id') id: string) {
    return this.formResponsesService.findOne(id);
  }

  // ========== GET BY USER ID ==========
  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Obtener respuestas de un usuario',
    description: 'Obtiene todas las respuestas de un usuario específico' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuestas del usuario obtenidas' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado o sin respuestas' 
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario' 
  })
  async findByUserId(@Param('userId') userId: string) {
    return this.formResponsesService.findByUserId(userId);
  }

  // ========== GET LATEST BY USER ==========
  @Get('user/:userId/latest')
  @ApiOperation({ 
    summary: 'Obtener última respuesta de un usuario',
    description: 'Obtiene la respuesta más reciente de un usuario' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Última respuesta encontrada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario sin respuestas' 
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario' 
  })
  async getLatestByUser(@Param('userId') userId: string) {
    const response = await this.formResponsesService.getLatestByUser(userId);
    if (!response) {
      return { message: 'El usuario no tiene respuestas registradas' };
    }
    return response;
  }

  // ========== UPDATE ==========
  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar respuesta',
    description: 'Actualiza una respuesta existente por su ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta actualizada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Respuesta no encontrada' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la respuesta a actualizar' 
  })
  @ApiBody({ type: UpdateFormResponseDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateFormResponseDto) {
    return this.formResponsesService.update(id, updateDto);
  }

  // ========== UPDATE LATEST BY USER ==========
  @Put('user/:userId/latest')
  @ApiOperation({ 
    summary: 'Actualizar última respuesta de usuario',
    description: 'Actualiza la respuesta más reciente de un usuario' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta actualizada' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario sin respuestas para actualizar' 
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario' 
  })
  @ApiBody({ type: UpdateFormResponseDto })
  async updateLatestByUser(@Param('userId') userId: string, @Body() updateDto: UpdateFormResponseDto) {
    return this.formResponsesService.updateLatestByUser(userId, updateDto);
  }

  // ========== CREATE OR UPDATE (UPSERT) ==========
  @Post('upsert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Crear o actualizar respuesta',
    description: 'Crea una nueva respuesta o actualiza la existente del usuario' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta creada o actualizada' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiQuery({ 
    name: 'userId', 
    required: true, 
    description: 'ID del usuario' 
  })
  @ApiBody({ type: CreateFormResponseDto })
  async createOrUpdate(
    @Query('userId') userId: string,
    @Body() createDto: CreateFormResponseDto,
  ) {
    return this.formResponsesService.createOrUpdate(userId, createDto);
  }

  // ========== DELETE ==========
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar respuesta',
    description: 'Elimina una respuesta específica por su ID' 
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Respuesta eliminada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Respuesta no encontrada' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID de la respuesta a eliminar' 
  })
  async remove(@Param('id') id: string) {
    return this.formResponsesService.remove(id);
  }

  // ========== DELETE BY USER ==========
  @Delete('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Eliminar todas las respuestas de un usuario',
    description: 'Elimina todas las respuestas asociadas a un usuario' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuestas eliminadas',
  })
  async removeByUser(@Param('userId') userId: string) {
    return this.formResponsesService.removeByUser(userId);
  }

  // ========== STATS ==========
  @Get('user/:userId/stats')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de respuestas de un usuario',
    description: 'Calcula estadísticas agregadas de respuestas de un usuario' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente' 
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID del usuario' 
  })
  async getUserStats(@Param('userId') userId: string) {
    return this.formResponsesService.getUserStats(userId);
  }
}