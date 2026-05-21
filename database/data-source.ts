import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';

dotenv.config({ path: '.env' });
dotenv.config({ path: `.env.${nodeEnv}`, override: true });

const safe = (value?: string) => (value ?? '').trim();

const databaseUrl = safe(process.env.DATABASE_URL);

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? {
        url: databaseUrl,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host:
          safe(process.env.DB_HOST) ||
          safe(process.env.DATABASE_HOST) ||
          '127.0.0.1',
        port: parseInt(
          safe(process.env.DB_PORT) || safe(process.env.DATABASE_PORT) || '5432',
          10,
        ),
        username:
          safe(process.env.DB_USERNAME) ||
          safe(process.env.DATABASE_USERNAME) ||
          'postgres',
        password:
          safe(process.env.DB_PASSWORD) ||
          safe(process.env.DATABASE_PASSWORD) ||
          '',
        database:
          safe(process.env.DB_DATABASE) ||
          safe(process.env.DATABASE_NAME) ||
          'aguasegura',
      }),
  
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Keep schema changes controlled by migrations in every environment.
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
