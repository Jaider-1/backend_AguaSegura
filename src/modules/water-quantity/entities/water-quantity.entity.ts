import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('water_quantities')
export class WaterQuantity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  liters: number; // Cantidad en litros

  @Column('decimal', { precision: 5, scale: 2 })
  percentage: number; // Porcentaje del tanque/disponible (0-100%)

  @CreateDateColumn()
  measuredAt: Date; // Fecha y hora de la medición

  @ManyToOne(() => User, user => user.waterQuantities, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}