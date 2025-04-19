# Database Seeding System

This directory contains the database seeding system for the Progress Path application. It uses `typeorm-extension` which internally utilizes `@faker-js/faker` to populate the database with initial data for development and testing purposes.

## Structure

- `data-source.ts` - TypeORM data source configuration
- `run-seed.ts` - Main script to run all seeders
- `/factories` - Entity factories that generate test data
- `/seeders` - Seeders that populate the database with entities
- `/migrations` - Database migrations

## Usage

### Running Seeds

To run all seeds, use the npm script:

```bash
npm run seed
```

This will:

1. Connect to the database using the DATABASE_URL environment variable
2. Run all seeders in the correct order
3. Log the progress to the console

### Factories

Factories are used to generate test data. They use the faker instance provided by typeorm-extension to create realistic data:

```typescript
// Example factory
import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../users/entities/user.entity';

export default setSeederFactory(User, (faker) => {
  const user = new User();
  user.username = faker.internet.userName();
  // ...
  return user;
});
```

### Seeders

Seeders populate the database with entities. They use factories to generate data:

```typescript
// Example seeder
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User } from '../../users/entities/user.entity';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userFactory = factoryManager.get(User);
    await userFactory.saveMany(10); // Create 10 random users
  }
}
```

## Included Seeders

1. `InitialDataSeeder` - Creates basic roles, permissions, and admin/test users
2. `SampleDataSeeder` - Creates sample lists and tasks for the test user

## Creating New Seeders

To create a new seeder:

1. Create a factory in the `/factories` directory
2. Create a seeder in the `/seeders` directory
3. Import the seeder in `run-seed.ts`

## Best Practices

1. Use factories to generate test data
2. Make seeders idempotent (safe to run multiple times)
3. Check if entities already exist before creating them
4. Use transactions for related entities
5. Include realistic sample data using the faker instance provided by typeorm-extension
6. Keep seeders focused on specific domains
