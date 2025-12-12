// src/modules/recommendations/entities/recommendation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WaterQuality } from '../../water-quality/entities/water-quality.entity';
import { WaterQuantity } from '../../water-quantity/entities/water-quantity.entity';

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ enum: ['low', 'medium', 'high', 'critical'] })
  priorityLevel: string;

  @Column({ enum: ['green', 'yellow', 'red'] })
  trafficLightColor: string;

  @Column()
  category: string;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isApplied: boolean;

  @Column({ type: 'timestamp', nullable: true })
  appliedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => User, user => user.recommendations, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => WaterQuality, { nullable: true })
  @JoinColumn({ name: 'waterQualityId' })
  waterQuality: WaterQuality;

  @Column({ nullable: true })
  waterQualityId: string;

  @ManyToOne(() => WaterQuantity, { nullable: true })
  @JoinColumn({ name: 'waterQuantityId' })
  waterQuantity: WaterQuantity;

  @Column({ nullable: true })
  waterQuantityId: string;
}