import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_payments_fees_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"children" varchar NOT NULL,
  	"not_working" numeric NOT NULL,
  	"part_time" numeric NOT NULL,
  	"full_time" numeric NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "payments_fees_admin_fee" numeric DEFAULT 30;
  ALTER TABLE "site_settings" ADD COLUMN "payments_fees_schedule" varchar DEFAULT 'Weekly, monthly or termly';
  ALTER TABLE "site_settings" ADD COLUMN "payments_fees_notes" varchar DEFAULT 'If you no longer wish your child to attend, please give four weeks’ notice. Without notice, weekly fees continue to be owed while your child is absent.';
  ALTER TABLE "site_settings_payments_fees_rows" ADD CONSTRAINT "site_settings_payments_fees_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_payments_fees_rows_order_idx" ON "site_settings_payments_fees_rows" USING btree ("_order");
  CREATE INDEX "site_settings_payments_fees_rows_parent_id_idx" ON "site_settings_payments_fees_rows" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_payments_fees_rows" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "payments_fees_admin_fee";
  ALTER TABLE "site_settings" DROP COLUMN "payments_fees_schedule";
  ALTER TABLE "site_settings" DROP COLUMN "payments_fees_notes";`)
}
