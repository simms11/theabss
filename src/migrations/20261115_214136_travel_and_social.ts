import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "social_instagram" SET DEFAULT 'https://www.instagram.com/abss20201/';
  ALTER TABLE "site_settings" ALTER COLUMN "social_x" SET DEFAULT 'https://x.com/ABSS_UK';
  ALTER TABLE "site_settings" ADD COLUMN "school_travel" varchar DEFAULT 'Buses: 2, 201, 415, 432 and 468.
  Trains: Tulse Hill station is about 10 minutes’ walk. Walk up the hill towards Brixton and the school is on your left.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "social_instagram" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "social_x" DROP DEFAULT;
  ALTER TABLE "site_settings" DROP COLUMN "school_travel";`)
}
