import { AppDataSource } from '../data-source';
import { Recommendation } from '../../src/modules/recommendations/entities/recommendation.entity';
import { seedRecommendations } from '../../src/modules/recommendations/entities/recommendations.seed';

async function runSeeders() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established.');
    const forceReseed = process.env.FORCE_RESEED === 'true';

    const recommendationRepository = AppDataSource.getRepository(Recommendation);
    const existingRulesCount = await recommendationRepository
      .createQueryBuilder('r')
      .where('r.name IS NOT NULL')
      .getCount();

    if (existingRulesCount > 0 && !forceReseed) {
      console.log(`Seeder skipped. Found ${existingRulesCount} existing recommendation rule(s).`);
      return;
    }

    if (existingRulesCount > 0 && forceReseed) {
      await recommendationRepository
        .createQueryBuilder()
        .delete()
        .from(Recommendation)
        .where('name IS NOT NULL')
        .execute();
      console.log(`Force reseed enabled. Deleted ${existingRulesCount} existing recommendation rule(s).`);
    }

    await seedRecommendations(AppDataSource);

    const insertedRulesCount = await recommendationRepository
      .createQueryBuilder('r')
      .where('r.name IS NOT NULL')
      .getCount();

    console.log(`Seeder completed. Inserted ${insertedRulesCount} recommendation rule(s).`);
  } catch (error) {
    console.error('Failed to run seeders:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runSeeders();
