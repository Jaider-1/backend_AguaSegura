import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('form_responses')
export class FormResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.formResponses, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Sección 1: Disposición al Reuso
  @Column()
  willingToReuse: boolean;

  @Column({ type: 'int' })
  reuseKnowledgeLevel: number; // 1-5

  @Column({ type: 'int' })
  motivationLevel: number; // 1-5

  // Sección 2: Métodos de Reuso
  @Column('simple-array')
  currentMethods: string[];

  @Column({ nullable: true })
  otherMethodsDescription: string;

  // Sección 3: Fuentes de Agua
  @Column('simple-array')
  potentialSources: string[];

  // Sección 4: Barreras
  @Column('simple-array')
  barriers: string[];

  @Column({ type: 'int', nullable: true })
  helpNeededLevel: number; // 1-5

  // Sección 5: Información del Hogar
  @Column({ type: 'int' })
  householdMembers: number;

  @Column()
  housingType: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'float', nullable: true })
  monthlyWaterConsumption: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
