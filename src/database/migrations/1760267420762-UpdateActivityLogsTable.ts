import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateActivityLogsTable1760267420762
  implements MigrationInterface
{
  name = 'UpdateActivityLogsTable1760267420762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD "success" boolean`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_logs_source_enum" AS ENUM('WEB', 'MOBILE', 'API', 'SYSTEM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD "source" "public"."activity_logs_source_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN "source"`);
    await queryRunner.query(`DROP TYPE "public"."activity_logs_source_enum"`);
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP COLUMN "success"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" DROP COLUMN "description"`,
    );
  }
}
