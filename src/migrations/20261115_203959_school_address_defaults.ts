import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "school_venue" SET DEFAULT 'City Heights E-ACT Academy';
  ALTER TABLE "site_settings" ALTER COLUMN "school_address" SET DEFAULT '33 Abbots Park
London SW2 3PW';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "school_venue" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "school_address" DROP DEFAULT;`)
}
