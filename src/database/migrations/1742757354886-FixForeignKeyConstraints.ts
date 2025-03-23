import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixForeignKeyConstraints1742757354886
  implements MigrationInterface
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration represents changes made to entity relationships to fix foreign key constraints
    // 1. Added unique foreign key constraint names in User entity: FK_user_profile, FK_user_subscription, FK_user_preference
    // 2. Removed redundant @JoinColumn decorators from child entities (UserProfile, SubscriptionDetail, UserPreference)
    // In case there are duplicate constraints, we would drop them and recreate with unique names
    // However, since we've already fixed the schema via entity changes, this is just a documentation migration
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    // No need for down migration as the changes were made at the entity level
  }
}
