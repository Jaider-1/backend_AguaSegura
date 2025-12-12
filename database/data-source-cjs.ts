// database/data-source-cjs.ts
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de DataSource (CommonJS compatible)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'aguasegura',
  
  // Rutas absolutas para evitar problemas
  migrations: [
    __dirname + '/migrations/*.ts'
  ],
  
  // Incluir entidades si es necesario
  entities: [
    __dirname + '/../src/**/*.entity{.ts,.js}'
  ],
  
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
});