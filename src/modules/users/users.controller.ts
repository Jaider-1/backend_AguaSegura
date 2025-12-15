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
}