import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere, DeepPartial } from 'typeorm';
import { WaterQuantity } from './entities/water-quantity.entity';
import { CreateWaterQuantityDto } from './dto/create-water-quantity.dto';
import { UpdateWaterQuantityDto } from './dto/update-water-quantity.dto';

@Injectable()
export class WaterQuantityService {
  constructor(
    @InjectRepository(WaterQuantity)
    private waterQuantityRepository: Repository<WaterQuantity>,
  ) {}


   async createFromPlainData(plainDto: CreateWaterQuantityDto, userId?: string): Promise<WaterQuantity> {
    this.validatePlainData(plainDto);

    // Convertir formato plano a formato interno
    const waterQuantityData: DeepPartial<WaterQuantity> = {
      level: plainDto.cantidad_porcentual_agua, // Mapear a level (que ya existe como porcentaje)
      cantidadPorcentual: plainDto.cantidad_porcentual_agua, // Guardar también en nuevo campo
      location: plainDto.location,
      deviceId: plainDto.deviceId,
      // Establecer valores por defecto para otros campos requeridos
      volume: 0, // Valor por defecto
      flowRate: 0, // Valor por defecto
      pressure: 0, // Valor por defecto
      createdAt: new Date(plainDto.fecha_hora) // Usar la fecha proporcionada
    };

    // Solo agregar userId si es válido (no null, no undefined, no 'null')
    if (userId && userId !== 'null' && userId.trim() !== '') {
      waterQuantityData.userId = userId;
    }

    const waterQuantity = this.waterQuantityRepository.create(waterQuantityData);
    return await this.waterQuantityRepository.save(waterQuantity);
  }

  async createBatchFromDevice(batchData: CreateWaterQuantityDto[], deviceId?: string) {
    const results = [];

    for (const data of batchData) {
      const normalizedData = {
        ...data,
        deviceId: data.deviceId || deviceId,
      };

      try {
        const result = await this.createFromPlainData(normalizedData);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      success: true,
      message: `Procesados ${batchData.length} registros`,
      processed: results.filter((result) => result.success).length,
      failed: results.filter((result) => !result.success).length,
      results,
    };
  }

  async create(createWaterQuantityDto: CreateWaterQuantityDto, userId: string): Promise<WaterQuantity> {
    // Add userId to the DTO
    const waterQuantityData = {
      ...createWaterQuantityDto,
      userId
    };
    
    const waterQuantity = this.waterQuantityRepository.create(waterQuantityData);
    return await this.waterQuantityRepository.save(waterQuantity);
  }

  async findOneByUser(id: string, userId: string): Promise<WaterQuantity> {
    const waterQuantity = await this.waterQuantityRepository.findOne({
      where: { id, userId },
    });
    if (!waterQuantity) {
      throw new NotFoundException(`Datos de cantidad de agua con ID ${id} no encontrados para el usuario`);
    }
    return waterQuantity;
  }

  async findAll(): Promise<WaterQuantity[]> {
    return this.waterQuantityRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async updateByUser(id: string, userId: string, updateWaterQuantityDto: UpdateWaterQuantityDto): Promise<WaterQuantity> {
    const waterQuantity = await this.findOneByUser(id, userId);
    Object.assign(waterQuantity, updateWaterQuantityDto);
    return this.waterQuantityRepository.save(waterQuantity);
  }

  async findAllWithFilters(
    startDate?: Date, 
    endDate?: Date,
    limit?: number
  ): Promise<WaterQuantity[]> {
    const queryOptions: { where?: FindOptionsWhere<WaterQuantity>; order: { createdAt: "DESC" | "ASC" }; take?: number } = {
      order: { createdAt: "DESC" },
    };
    // Apply date filters if provided
    if (startDate && endDate) {
      queryOptions.where = {
        createdAt: Between(startDate, endDate),
      };
    } else if (startDate) {
      queryOptions.where = {
        createdAt: MoreThanOrEqual(startDate),
      };
    } else if (endDate) {
      queryOptions.where = {
        createdAt: LessThanOrEqual(endDate),
      };
    }
    // Apply limit if provided
    if (limit) {
      queryOptions.take = limit;
    }
    return this.waterQuantityRepository.find(queryOptions);
  }

  async findByUserWithFilters(
    userId: string, 
    startDate?: Date, 
    endDate?: Date, 
    limit?: number
  ): Promise<WaterQuantity[]> {
    const queryOptions: { where: FindOptionsWhere<WaterQuantity>; order: { createdAt: "DESC" | "ASC" }; take?: number } = {
      where: { userId },
      order: { createdAt: "DESC" },
    };

    // Apply date filters if provided
    if (startDate && endDate) {
      queryOptions.where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      queryOptions.where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      queryOptions.where.createdAt = LessThanOrEqual(endDate);
    }

    // Apply limit if provided
    if (limit) {
      queryOptions.take = limit;
    }

    return this.waterQuantityRepository.find(queryOptions);
  }

  async findOne(id: string): Promise<WaterQuantity> {
    const waterQuantity = await this.waterQuantityRepository.findOne({
      where: { id },
    });

    if (!waterQuantity) {
      throw new NotFoundException(`Datos de cantidad de agua con ID ${id} no encontrados`);
    }

    return waterQuantity;
  }

  async update(id: string, updateWaterQuantityDto: UpdateWaterQuantityDto): Promise<WaterQuantity> {
    const waterQuantity = await this.findOne(id);
    Object.assign(waterQuantity, updateWaterQuantityDto);
    return this.waterQuantityRepository.save(waterQuantity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.waterQuantityRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Datos de cantidad de agua con ID ${id} no encontrados`);
    }
  }

  async findByUser(userId: string): Promise<WaterQuantity[]> {
    return this.waterQuantityRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async findLatestByUser(userId: string): Promise<WaterQuantity | null> {
    return this.waterQuantityRepository.findOne({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  // NEW: Public methods for public endpoints
  async getLatest(): Promise<WaterQuantity | null> {
    const rows = await this.waterQuantityRepository.find({
      order: { createdAt: "DESC" },
      take: 1,
    });
    return rows[0] ?? null;
  }

  async getStats(): Promise<{ totalRecords: number; latestRecord: WaterQuantity | null }> {
    // Example stats - customize based on your needs
    const total = await this.waterQuantityRepository.count();
    const latest = await this.getLatest();
    
    // You can add more statistical calculations here
    return {
      totalRecords: total,
      latestRecord: latest,
      // Add more stats as needed
    };
  }

  private validatePlainData(plainDto: CreateWaterQuantityDto): void {
    if (Number.isNaN(new Date(plainDto.fecha_hora).getTime())) {
      throw new BadRequestException('fecha_hora debe ser una fecha válida');
    }

    if (plainDto.cantidad_porcentual_agua < 0 || plainDto.cantidad_porcentual_agua > 100) {
      throw new BadRequestException('cantidad_porcentual_agua debe estar entre 0 y 100');
    }
  }
}
