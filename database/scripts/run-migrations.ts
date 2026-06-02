import { AppDataSource } from '../data-source';

const REQUIRED_TABLES = [
  'users',
  'water_quality',
  'water_quantity',
  'form_responses',
  'recommendation',
];

async function getMissingTables(): Promise<string[]> {
  const rows = await AppDataSource.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `,
  );
  const existing = new Set(rows.map((r: { table_name: string }) => r.table_name));
  return REQUIRED_TABLES.filter((table) => !existing.has(table));
}

async function runMigrations() {
  try {
    await AppDataSource.initialize();
    const migrations = await AppDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log('No pending migrations found.');
    } else {
      console.log(`Applied ${migrations.length} migration(s).`);
      for (const migration of migrations) {
        console.log(`- ${migration.name}`);
      }
    }

    const missingTables = await getMissingTables();
    if (missingTables.length > 0) {
      console.warn(
        `Missing required tables detected: ${missingTables.join(', ')}. Running schema synchronize fallback...`,
      );
      await AppDataSource.synchronize();

      const stillMissing = await getMissingTables();
      if (stillMissing.length > 0) {
        throw new Error(`Tables still missing after synchronize: ${stillMissing.join(', ')}`);
      }
      console.log('All required module tables are now present.');
    } else {
      console.log('All required module tables are present.');
    }
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runMigrations();
