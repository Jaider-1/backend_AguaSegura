// src/modules/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;


}


export { PaginationMeta };


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}




  async findAll(page: number = 1, limit: number = 10): Promise<{ data: User[]; meta: PaginationMeta }> {
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

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.preload({
      id,
      ...updateData,
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    await this.usersRepository.remove(user);
  }

  async UserStats(): Promise<{ totalUsers: number; activeUsers: number; inactiveUsers: number }> {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({ where: { isActive: true } });
    const inactiveUsers = totalUsers - activeUsers;
    return { totalUsers, activeUsers, inactiveUsers };
  }



  







}