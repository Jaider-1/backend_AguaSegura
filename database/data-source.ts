// database/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { runAllSeeds } from './seeds';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'jaider123',
  database: process.env.DB_DATABASE || 'aguasegura',
  
  // SOLO entidades de negocio (@Entity decorator)
  entities: [__dirname + '/../../src/modules/recommendations/entities/recommendation-rules.entity.ts'],
  
  // No necesitamos migraciones para tablas tipo
  migrations: [],
  
  synchronize: false, // Importante: false
  logging: true,
});

export default runAllSeeds