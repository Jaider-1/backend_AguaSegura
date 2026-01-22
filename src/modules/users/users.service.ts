// src/modules/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: User[]; meta: any }> {
    // Asegurar que page y limit sean números
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    
    // Validar valores mínimos
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.max(1, Math.min(limitNum, 100)); // Máximo 100 por página

    const [users, total] = await this.usersRepository.findAndCount({
      select: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'],
      skip: (validPage - 1) * validLimit,
      take: validLimit,
      order: { createdAt: 'DESC' }
    });

    return {
      data: users,
      meta: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit)
      }
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'role', 'isActive', 'householdSize', 'reuseDisposition', 'climateConditions', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'role', 'isActive', 'householdSize', 'reuseDisposition', 'climateConditions', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    return user;
  }
}