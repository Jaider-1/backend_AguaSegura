// src/modules/recommendations/entities/recommendation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WaterQuality } from '../../water-quality/entities/water-quality.entity';
import { WaterQuantity } from '../../water-quantity/entities/water-quantity.entity';

@Entity('recommendation')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Contenido principal de la recomendaciÃ³n/regla
  @Column({ type: 'text', name: 'recommendation_text' })
  message: string;

  // Campos de regla (opcionales)
  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'min_quantity_percentage' })
  minQuantityPercentage?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'max_quantity_percentage' })
  maxQuantityPercentage?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'min_quality_irc' })
  minQualityIrc?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'max_quality_irc' })
  maxQualityIrc?: number;

  @Column({ type: 'text', array: true, nullable: true, name: 'climate_conditions' })
  climateConditions?: string[];

  @Column({ type: 'text', array: true, nullable: true, name: 'reuse_dispositions' })
  reuseDispositions?: string[];

  @Column({ type: 'int', nullable: true, name: 'habitantes' })
  inhabitants?: number;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'tipo_vivienda' })
  housingType?: string;

  @Column({ enum: ['low', 'medium', 'high', 'critical'], name: 'priority_level' })
  priorityLevel: string;

  @Column({ enum: ['green', 'yellow', 'red'], name: 'traffic_light_color' })
  trafficLightColor: string;

  @Column()
  category: string;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ default: false, name: 'is_applied' })
  isApplied: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'applied_at' })
  appliedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt: Date;

  @ManyToOne(() => User, user => user.recommendations, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @ManyToOne(() => WaterQuality, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'water_quality_id' })
  waterQuality: WaterQuality;

  @Column({ type: 'uuid', nullable: true, name: 'water_quality_id' })
  waterQualityId: string;

  @ManyToOne(() => WaterQuantity, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'water_quantity_id' })
  waterQuantity: WaterQuantity;

  @Column({ type: 'uuid', nullable: true, name: 'water_quantity_id' })
  waterQuantityId: string;
}
