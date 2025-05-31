/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env file
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL as string;
const url = new URL(DATABASE_URL);

async function syncSchema() {
  console.log('Synchronizing database schema...');

  // Get all entity files
  const entityFiles = findEntityFiles('src');
  console.log(`Found ${entityFiles.length} entity files`);

  // Dynamically import all entities
  const entities: any[] = [];
  for (const file of entityFiles) {
    try {
      const entity = await import(`./${file}`);
      for (const key in entity) {
        if (entity[key] && typeof entity[key] === 'function') {
          entities.push(entity[key]);
        }
      }
    } catch (error) {
      console.error(`Error importing entity from file ${file}:`, error);
    }
  }

  console.log(`Loaded ${entities.length} entities`);

  // Create a connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: url.hostname,
    port: +url.port,
    username: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    entities,
    synchronize: true,
    logging: true,
  });

  // Connect and sync
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    // Sync the schema
    console.log('Schema synchronized successfully!');

    // Close the connection
    await dataSource.destroy();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error during schema synchronization:', error);
  }
}

function findEntityFiles(dir: string, files: string[] = []): string[] {
  const dirFiles = fs.readdirSync(dir);

  for (const file of dirFiles) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findEntityFiles(filePath, files);
    } else if (file.endsWith('.entity.ts')) {
      // Convert Windows-style paths to POSIX for imports
      files.push(filePath.replace(/\\/g, '/'));
    }
  }

  return files;
}

// Run the sync
syncSchema()
  .then(() => console.log('Done!'))
  .catch((error) => console.error('Error:', error));
