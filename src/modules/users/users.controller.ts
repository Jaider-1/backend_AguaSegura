// src/modules/users/users.controller.ts
import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite por página' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return {
      success: true,
      data: await this.usersService.findAll(page, limit)
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return {
      success: true,
      data: await this.usersService.findOne(id)
    };
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Obtener usuario por email' })
  @ApiParam({ name: 'email', description: 'Email del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findByEmail(@Param('email') email: string) {
    return {
      success: true,
      data: await this.usersService.findByEmail(email)
    };
  }

  // Endpoint especial para frontend
  @Get('demo/profile')
  @ApiOperation({ summary: 'Obtener perfil de usuario demo' })
  @ApiQuery({ name: 'email', required: false, description: 'Email para buscar' })
  @ApiResponse({ status: 200, description: 'Perfil de usuario' })
  async getDemoProfile(@Query('email') email?: string) {
    if (email) {
      try {
        const user = await this.usersService.findByEmail(email);
        return {
          success: true,
          data: user
        };
      } catch {
        // Si no existe, devolver datos demo
        return this.getDemoUserData(email);
      }
    }
    
    // Datos demo por defecto
    return this.getDemoUserData('demo@aguasegura.com');
  }

  private getDemoUserData(email: string) {
    return {
      success: true,
      data: {
        id: 'demo-user-id',
        email: email,
        name: 'Usuario Demo Aguasegura',
        role: 'user',
        householdSize: 4,
        reuseDisposition: 'Dispuesto',
        climateConditions: ['Normal'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: 'Datos de demostración. Registrate para tener tu perfil real.'
    };
  }
}