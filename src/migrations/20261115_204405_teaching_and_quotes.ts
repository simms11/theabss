import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_teaching_subjects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "teaching_intro" varchar DEFAULT 'We teach children aged 5 to 16 every Saturday morning in term time. We believe in academic excellence for all, and we want every pupil to aim high.';
  ALTER TABLE "site_settings" ADD COLUMN "teaching_tutoring" varchar DEFAULT 'One-to-one tutoring is available for pupils who need extra support in a subject.';
  ALTER TABLE "site_settings" ADD COLUMN "quotes_feature_text" varchar DEFAULT 'A people without the knowledge of their past history, origin and culture is like a tree without roots.';
  ALTER TABLE "site_settings" ADD COLUMN "quotes_feature_attribution" varchar DEFAULT 'The Honourable Marcus Mosiah Garvey';
  ALTER TABLE "site_settings" ADD COLUMN "quotes_closing_text" varchar DEFAULT 'Up, you mighty race, for you can accomplish what you will.';
  ALTER TABLE "site_settings" ADD COLUMN "quotes_closing_attribution" varchar DEFAULT 'The Honourable Marcus Mosiah Garvey';
  ALTER TABLE "site_settings_teaching_subjects" ADD CONSTRAINT "site_settings_teaching_subjects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_teaching_subjects_order_idx" ON "site_settings_teaching_subjects" USING btree ("_order");
  CREATE INDEX "site_settings_teaching_subjects_parent_id_idx" ON "site_settings_teaching_subjects" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_teaching_subjects" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "teaching_intro";
  ALTER TABLE "site_settings" DROP COLUMN "teaching_tutoring";
  ALTER TABLE "site_settings" DROP COLUMN "quotes_feature_text";
  ALTER TABLE "site_settings" DROP COLUMN "quotes_feature_attribution";
  ALTER TABLE "site_settings" DROP COLUMN "quotes_closing_text";
  ALTER TABLE "site_settings" DROP COLUMN "quotes_closing_attribution";`)
}
