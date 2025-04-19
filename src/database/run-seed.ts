import { runSeeders } from 'typeorm-extension';
import dataSource from './data-source';
import * as path from 'path';

import InitialDataSeeder from './seeders/initial-data.seeder';
import SampleDataSeeder from './seeders/sample-data.seeder';
import { clearDatabase } from './clear-database';

void (async () => {
  try {
    await dataSource.initialize();
    console.log('Database connection initialized');

    await clearDatabase();
    console.log('Database cleared successfully!');

    await runSeeders(dataSource, {
      seeds: [InitialDataSeeder, SampleDataSeeder],
      factories: [path.join(__dirname, 'factories', '*.factory.ts')],
    });

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding process:', error);
    process.exit(1);
  }
})();
