import dataSource from './data-source';

export const clearDatabase = async () => {
  const entities = dataSource.entityMetadatas;

  const tableNames = entities
    .map((entity) => `"${entity.tableName}"`)
    .join(', ');

  // Execute TRUNCATE on all tables with CASCADE to handle foreign key constraints.
  await dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);
};
