import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WaterQuantity } from '../../water-quantity/entities/water-quantity.entity';
import { WaterQuality } from '../../water-quality/entities/water-quality.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // RELACIONES
  @OneToMany(() => WaterQuantity, waterQuantity => waterQuantity.user)
  waterQuantities: WaterQuantity[];

  @OneToMany(() => WaterQuality, waterQuality => waterQuality.user)
  waterQualities: WaterQuality[];
}