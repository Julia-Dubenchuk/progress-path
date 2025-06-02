import { DataSource, DataSourceOptions } from 'typeorm';
import settings from '../config/settings';

// Database configuration
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: settings.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: settings.NODE_ENV !== 'production',
  migrationsRun: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
