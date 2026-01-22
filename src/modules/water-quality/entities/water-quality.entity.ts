import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('water_qualities')
export class WaterQuality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Parámetros principales
  @Column('decimal', { precision: 5, scale: 2 })
  irca: number; // Índice de Riesgo de Calidad del Agua (0-100%)

  @Column('decimal', { precision: 4, scale: 2, nullable: true })
  ph: number; // Potencial de Hidrógeno

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  turbidity: number; // Turbidez en NTU

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  temperature: number; // Temperatura en °C

  @Column('decimal',{ precision: 10, scale: 2, nullable: true }) 
  conductivity: number; // Conductividad en µS/cm

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  dissolvedOxygen: number; // Oxígeno Disuelto en mg/L
  
  // Metadata
  @Column({ nullable: true })
  deviceId: string;


  @CreateDateColumn()
  measuredAt: Date;

  @ManyToOne(() => User, user => user.waterQualities, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}