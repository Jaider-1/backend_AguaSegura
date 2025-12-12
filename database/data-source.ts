// database/data-source.ts
import { DataSource } from 'typeorm';
import * as path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'tu_password',
  database: process.env.DB_DATABASE || 'aguasegura',
  
  entities: [
    path.join(__dirname, '../src/**/*.entity{.ts,.js}'),
    path.join(__dirname, './**/*.entity{.ts,.js}'),
  ],
  
  migrations: [
    path.join(__dirname, './migrations/*{.ts,.js}'),
  ],
  
  migrationsTableName: 'migrations',
  synchronize: false, // IMPORTANTE: false en producción
  logging: true,
});