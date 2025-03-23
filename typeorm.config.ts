import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://root:root@localhost:5432/progress_path_db';
const url = new URL(DATABASE_URL);

export default new DataSource({
  type: 'postgres',
  host: url.hostname,
  port: +url.port,
  username: url.username,
  password: url.password,
  database: url.pathname.substring(1),
  entities: [path.join(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'src/database/migrations/**/*{.ts,.js}')],
  logging: true,
});
