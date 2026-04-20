import { AppDataSource } from '../data-source';
import { Recommendation } from '../../src/modules/recommendations/entities/recommendation.entity';

const BASELINE_RULE_NAME = 'BASELINE_WATER_CARE_RULE';

async function runSeeders() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established.');

    const recommendationRepository = AppDataSource.getRepository(Recommendation);
    const existingRule = await recommendationRepository.findOne({
      where: { name: BASELINE_RULE_NAME },
    });

    if (existingRule) {
      console.log(`Seeder skipped. Rule "${BASELINE_RULE_NAME}" already exists.`);
      return;
    }

    await recommendationRepository.save(
      recommendationRepository.create({
        name: BASELINE_RULE_NAME,
        message: 'Mantenga recipientes limpios y tapados para reducir riesgos de contaminacion.',
        description: 'Regla base aplicada cuando no hay condiciones de riesgo elevadas.',
        priorityLevel: 'low',
        trafficLightColor: 'green',
        category: 'basica',
        parameters: {
          source: 'seed',
          version: 1,
        },
      }),
    );

    console.log(`Seeder completed. Rule "${BASELINE_RULE_NAME}" was created.`);
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
