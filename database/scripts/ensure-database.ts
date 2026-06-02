import { Client } from 'pg';
import * as dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: '.env' });
dotenv.config({ path: `.env.${nodeEnv}`, override: true });

const safe = (value?: string) => (value ?? '').trim();

function getDbConfig() {
  const host = safe(process.env.DB_HOST) || safe(process.env.DATABASE_HOST) || '127.0.0.1';
  const port = parseInt(safe(process.env.DB_PORT) || safe(process.env.DATABASE_PORT) || '5432', 10);
  const user = safe(process.env.DB_USERNAME) || safe(process.env.DATABASE_USERNAME) || 'postgres';
  const password = safe(process.env.DB_PASSWORD) || safe(process.env.DATABASE_PASSWORD) || '';
  const database = safe(process.env.DB_DATABASE) || safe(process.env.DATABASE_NAME) || 'aguasegura';
  return { host, port, user, password, database };
}

async function ensureDatabase() {
  const cfg = getDbConfig();

  // Connect to default administrative DB to create/check target DB.
  const adminClient = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    const check = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [cfg.database]);

    if (check.rowCount && check.rowCount > 0) {
      console.log(`Database "${cfg.database}" already exists.`);
      return;
    }

    await adminClient.query(`CREATE DATABASE "${cfg.database.replace(/"/g, '""')}"`);
    console.log(`Database "${cfg.database}" created successfully.`);
  } catch (error) {
    console.error('Failed to ensure database:', error);
    process.exitCode = 1;
  } finally {
    await adminClient.end().catch(() => undefined);
  }
}

void ensureDatabase();
