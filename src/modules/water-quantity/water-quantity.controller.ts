import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WaterQuantityService } from './water-quantity.service';
import { CreateWaterQuantityDto } from './dto/create-water-quantity.dto';

@ApiTags('water-quantity')
@Controller('water-quantity')
export class WaterQuantityController {
    constructor(private readonly waterQuantityService: WaterQuantityService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'crear nuevo registro de cantidad de agua' })
    @ApiResponse({ status: 201, description: 'Registro creado exitosamente' })
    async create(@Body() createDto: CreateWaterQuantityDto, @Request() req) {
        const userId = req.user?.userId || req.user2?.userId; // Check both possibilities
        return this.waterQuantityService.create(createDto, userId);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener MI historial de cantidad de agua' })
    @ApiResponse({ status: 200, description: 'Lista de registros' })
    async findAll(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: number,
    ) {
        const userId = req.user?.userId || req.user2?.userId;
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.waterQuantityService.findByUserWithFilters(userId, start, end, limit);
    }

    @Get('public/latest')
    @ApiOperation({ summary: 'Obtener el último registro público' })
    async getPublicLatest() {
        return this.waterQuantityService.getLatest();
    }

    @Get('public/stats')
    @ApiOperation({ summary: 'Obtener estadísticas públicas' })
    async getPublicStats() {
        return this.waterQuantityService.getStats();
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener un registro de cantidad de agua por ID' })
    @ApiResponse({ status: 200, description: 'Registro encontrado' })
    async findOne(@Param('id') id: string, @Request() req) {
        const userId = req.user?.userId || req.user2?.userId;
        return this.waterQuantityService.findOneByUser(id, userId);
    }
}