import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('form_responses')
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // ===== SECCIÓN 1: Disposición al Reuso =====
  @Column()
  willingToReuse: boolean;

  @Column('int')
  reuseKnowledgeLevel: number; // 1-5

  @Column('int')
  motivationLevel: number; // 1-5

  // ===== SECCIÓN 2: Métodos de Reuso =====
  @Column('simple-array')
  currentMethods: string[]; // Array de métodos

  @Column('text', { nullable: true })
  otherMethodsDescription: string;

  // ===== SECCIÓN 3: Fuentes de Agua =====
  @Column('simple-array')
  potentialSources: string[]; // Array de fuentes

  // ===== SECCIÓN 4: Barreras =====
  @Column('simple-array')
  barriers: string[]; // Array de barreras

  // ===== SECCIÓN 5: Información del Hogar =====
  @Column('int')
  householdMembers: number;

  @Column()
  housingType: string;

  @Column({ nullable: true })
  location: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  monthlyWaterConsumption: number;

  // Relación
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}