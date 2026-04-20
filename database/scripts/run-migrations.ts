import { AppDataSource } from '../data-source';

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
