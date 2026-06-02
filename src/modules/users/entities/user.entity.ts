import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { WaterQuantity } from '../../water-quantity/entities/water-quantity.entity';
import { WaterQuality } from '../../water-quality/entities/water-quality.entity';
import { Recommendation } from '../../recommendations/entities/recommendation.entity';
import { FormResponse } from '../../form-responses/entities/form-response.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  householdSize: number;

  @Column({ nullable: true })
  reuseDisposition: string; // 'Dispuesto', 'En dudas', 'No dispuesto'

  @Column({ type: 'simple-array', nullable: true })
  climateConditions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Recommendation, recommendation => recommendation.user)
  recommendations: Recommendation[];

   @OneToMany(() => WaterQuality, waterQuality => waterQuality.user)
  waterQualities: WaterQuality[];

  @OneToMany(() => WaterQuantity, waterQuantity => waterQuantity.user)
  waterQuantities: WaterQuantity[];

  @OneToMany(() => FormResponse, formResponse => formResponse.user)
  formResponses: FormResponse[];
}
