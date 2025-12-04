import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { WaterQuantity } from "./entities/water-quantity.entity";
import { CreateWaterQuantityDto } from "./dto/create-water-quantity.dto";

@Injectable()
export class WaterQuantityService {
  constructor(
    @InjectRepository(WaterQuantity)
    private waterQuantityRepository: Repository<WaterQuantity>
  ) {}

  async create(
    createDto: CreateWaterQuantityDto,
    userId?: string
  ): Promise<WaterQuantity> {
    const waterQuantity = this.waterQuantityRepository.create({
      ...createDto,
      userId, // ← Aquí se asocia el usuario
      measuredAt: new Date(),
    });

    return this.waterQuantityRepository.save(waterQuantity);
  }

  async findAll(
    userId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50
  ): Promise<WaterQuantity[]> {
    const where: any = {};

    if (userId) {
      where.userId = userId; // ← Filtrar por usuario
    }

    if (startDate && endDate) {
      where.measuredAt = Between(startDate, endDate);
    }

    return this.waterQuantityRepository.find({
      where,
      order: { measuredAt: "DESC" },
      take: limit,
    });
  }

  async findOne(id: string): Promise<WaterQuantity> {
    const waterQuantity = await this.waterQuantityRepository.findOne({
      where: { id },
    });

    if (!waterQuantity) {
      throw new NotFoundException("Registro de cantidad de agua no encontrado");
    }

    return waterQuantity;
  }

  async getLatest(userId?: string): Promise<WaterQuantity> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const latest = await this.waterQuantityRepository.findOne({
      where,
      order: { measuredAt: "DESC" },
    });

    if (!latest) {
      throw new NotFoundException("No hay registros de cantidad de agua");
    }

    return latest;
  }

  async getStats(userId?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const stats = await this.waterQuantityRepository
      .createQueryBuilder("water_quantity")
      .select([
        "AVG(water_quantity.liters) as avgLiters",
        "SUM(water_quantity.liters) as totalLiters",
        "AVG(water_quantity.percentage) as avgPercentage",
        "MIN(water_quantity.percentage) as minPercentage",
        "MAX(water_quantity.percentage) as maxPercentage",
        "COUNT(water_quantity.id) as totalRecords",
      ])
      .where(where)
      .getRawOne();

    // Obtener el registro más reciente de hoy
    const latestToday = await this.waterQuantityRepository.findOne({
      where: {
        ...where,
        measuredAt: Between(startOfDay, endOfDay),
      },
      order: { measuredAt: "DESC" },
    });

    return {
      ...stats,
      latestToday: latestToday || null,
    };
  }
}
