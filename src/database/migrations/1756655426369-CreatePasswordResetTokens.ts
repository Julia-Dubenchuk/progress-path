import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetTokens1756655426369
  implements MigrationInterface
{
  name = 'CreatePasswordResetTokens1756655426369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "password_reset_tokens" (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "token" text NOT NULL,
            "expires_at" timestamptz NOT NULL,
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz NOT NULL DEFAULT now(),
            "user_id" uuid NOT NULL,
            CONSTRAINT "PK_password_reset_tokens_id" PRIMARY KEY ("id")
        )`);

    await queryRunner.query(`ALTER TABLE "password_reset_tokens"
            ADD CONSTRAINT "FK_password_reset_tokens_user_id_users_id"
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "FK_password_reset_tokens_user_id_users_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
  }
}
