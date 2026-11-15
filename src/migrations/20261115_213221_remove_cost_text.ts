import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "payments_intro" SET DEFAULT 'What it costs, and how to pay. Fees depend on how many children attend and on your work situation, so that the school stays affordable for every family.';
  ALTER TABLE "site_settings" DROP COLUMN "school_fees";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ALTER COLUMN "payments_intro" SET DEFAULT 'You can pay fees or make a donation by card or by bank transfer.';
  ALTER TABLE "site_settings" ADD COLUMN "school_fees" varchar;`)
}
