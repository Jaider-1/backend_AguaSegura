import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  irca: number;

  @Column('float', { nullable: true })
  ph: number;

  @Column('float', { nullable: true })
  turbidity: number;

  @Column('float', { nullable: true })
  temperature: number;

  @CreateDateColumn()
  createdAt: Date;
}
