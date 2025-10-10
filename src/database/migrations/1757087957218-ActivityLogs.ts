import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityLogs1757087957218 implements MigrationInterface {
  name = 'ActivityLogs1757087957218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE activity_logs
      ALTER COLUMN "userId" DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE activity_logs
      ADD COLUMN IF NOT EXISTS ip varchar(45) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE activity_logs
      ADD COLUMN IF NOT EXISTS meta jsonb NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_userid ON activity_logs ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs (action);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_activity_logs_userid;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_activity_logs_action;
    `);

    await queryRunner.query(`
      ALTER TABLE activity_logs
      DROP COLUMN IF EXISTS ip;
    `);

    await queryRunner.query(`
      ALTER TABLE activity_logs
      DROP COLUMN IF EXISTS meta;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM activity_logs WHERE "userId" IS NULL) THEN
          ALTER TABLE activity_logs
          ALTER COLUMN "userId" SET NOT NULL;
        END IF;
      END
      $$;
    `);
  }
}
