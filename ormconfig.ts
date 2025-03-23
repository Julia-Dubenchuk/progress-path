import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://root:root@localhost:5432/progress_path_db';
const url = new URL(DATABASE_URL);

const config: DataSourceOptions = {
  type: 'postgres',
  host: url.hostname,
  port: +url.port,
  username: url.username,
  password: url.password,
  database: url.pathname.substring(1),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
};

export default config;
