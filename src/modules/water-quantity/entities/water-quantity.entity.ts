// src/modules/water-quantity/entities/water-quantity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('water_quantity')
export class WaterQuantity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  volume: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  flowRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  level: number; // Porcentaje (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  pressure: number;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  deviceId: string;

  @CreateDateColumn()
  createdAt: Date; // ESTA ES LA PROPERTY QUE DEBES USAR

  // Relación opcional con usuario
  @ManyToOne(() => User, user => user.waterQuantities, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ 
    name: 'cantidad_porcentual', 
    type: 'decimal', 
    precision: 5, 
    scale: 2,
    nullable: true 
  })
  cantidadPorcentual: number; // Nuevo campo para el formato plano
}
