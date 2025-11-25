import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Measurement {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  irca: number;

  @Column({ type: 'float', nullable: true })
  ph: number;

  @Column({ type: 'float', nullable: true })
  turbidity: number;

  @Column({ type: 'float', nullable: true })
  temperature: number;

  @Column({ type: 'float', nullable: true })
  waterAmount: number; // cantidad del agua (opcional)

  @CreateDateColumn()
  createdAt: Date;
}
