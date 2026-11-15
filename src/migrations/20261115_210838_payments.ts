import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_payments_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "payments_intro" varchar DEFAULT 'You can pay fees or make a donation by card or by bank transfer.';
  ALTER TABLE "site_settings" ADD COLUMN "payments_bank_account_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "payments_bank_bank_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "payments_bank_sort_code" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "payments_bank_account_number" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "payments_bank_reference" varchar;
  ALTER TABLE "site_settings_payments_links" ADD CONSTRAINT "site_settings_payments_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_payments_links_order_idx" ON "site_settings_payments_links" USING btree ("_order");
  CREATE INDEX "site_settings_payments_links_parent_id_idx" ON "site_settings_payments_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_payments_links" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "payments_intro";
  ALTER TABLE "site_settings" DROP COLUMN "payments_bank_account_name";
  ALTER TABLE "site_settings" DROP COLUMN "payments_bank_bank_name";
  ALTER TABLE "site_settings" DROP COLUMN "payments_bank_sort_code";
  ALTER TABLE "site_settings" DROP COLUMN "payments_bank_account_number";
  ALTER TABLE "site_settings" DROP COLUMN "payments_bank_reference";`)
}
