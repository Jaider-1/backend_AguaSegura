import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host:
    process.env.DB_HOST ||
    process.env.DATABASE_HOST ||
    '127.0.0.1',
  port: parseInt(
    process.env.DB_PORT || process.env.DATABASE_PORT || '5432',
    10,
  ),
  username:
    process.env.DB_USERNAME ||
    process.env.DATABASE_USERNAME ||
    'postgres',
  password:
    process.env.DB_PASSWORD ||
    process.env.DATABASE_PASSWORD ||
    '',
  database:
    process.env.DB_DATABASE ||
    process.env.DATABASE_NAME ||
    'aguasegura',
  
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // Solo para desarrollo
  logging: process.env.NODE_ENV === 'development',
});
