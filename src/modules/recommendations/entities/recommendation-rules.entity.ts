import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('recommendation_rules')
export class RecommendationRules {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  min_quantity_percentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  max_quantity_percentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  min_quality_irc: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  max_quality_irc: number;

  @Column({ type: 'simple-array', nullable: true })
  climate_conditions: string[];

  @Column({ type: 'simple-array', nullable: true })
  reuse_dispositions: string[];

  @Column({ type: 'text' })
  recommendation_text: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['low', 'medium', 'high', 'critical']
  })
  priority_level: string;

  @Column({
    type: 'varchar',
    length: 10,
    enum: ['green', 'yellow', 'red']
  })
  traffic_light_color: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}