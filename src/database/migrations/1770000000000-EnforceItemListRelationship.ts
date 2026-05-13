import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnforceItemListRelationship1770000000000
  implements MigrationInterface
{
  name = 'EnforceItemListRelationship1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "items" ALTER COLUMN "listId" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "FK_4ad0ddb6ccc6586490df06d466f"',
    );
    await queryRunner.query(
      'ALTER TABLE "items" ADD CONSTRAINT "FK_4ad0ddb6ccc6586490df06d466f" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "items" DROP CONSTRAINT IF EXISTS "FK_4ad0ddb6ccc6586490df06d466f"',
    );
    await queryRunner.query(
      'ALTER TABLE "items" ADD CONSTRAINT "FK_4ad0ddb6ccc6586490df06d466f" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "items" ALTER COLUMN "listId" DROP NOT NULL',
    );
  }
}
