// src/modules/water-quality/entities/water-quality.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('water_quality')
export class WaterQuality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Parámetros crudos (lo que llega del dispositivo/CSV)
  @Column('decimal', { precision: 4, scale: 2, nullable: true })
  ph: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  temperature: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  turbidity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  conductivity: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  dissolvedOxygen: number;

  // Resultado final para el frontend (IRCA mapeado)
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  calidad: number; // Valor IRCA (0-100) después de conversión

  @Column({ nullable: true })
  calidadCategoria: string; // 'sin riesgo', 'medio', 'inviable'

  @Column({ nullable: true })
  calidadColor: string; // 'green', 'yellow', 'red'

  // Guardamos el ICA original para referencia (opcional pero útil)
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  icaOriginal: number;

  // Subíndices individuales (guardados como JSON para debugging)
  @Column('json', { nullable: true })
  subindices: {
    od: number;
    ph: number;
    turbidez: number;
    conductividad: number;
    temperatura: number;
  };

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