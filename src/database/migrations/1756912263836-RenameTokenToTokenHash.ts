import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTokenToTokenHash1756912263836 implements MigrationInterface {
  name = 'RenameTokenToTokenHash1756912263836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "tokenHash" character varying(64) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "used" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "used"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP COLUMN "tokenHash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" ADD "token" character varying NOT NULL`,
    );
  }
}
