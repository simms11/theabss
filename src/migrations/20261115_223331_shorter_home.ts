import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_teaching_subjects" DROP COLUMN "description";
  ALTER TABLE "site_settings" DROP COLUMN "school_history";
  ALTER TABLE "site_settings" DROP COLUMN "teaching_tutoring";
  ALTER TABLE "site_settings" DROP COLUMN "quotes_closing_text";
  ALTER TABLE "site_settings" DROP COLUMN "quotes_closing_attribution";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_teaching_subjects" ADD COLUMN "description" varchar NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "school_history" varchar DEFAULT 'Our school is named in honour of Afruika Bantu (Annette Blair, 1955–1999): a freedom fighter, activist, scholar, African History researcher and teacher.';
  ALTER TABLE "site_settings" ADD COLUMN "teaching_tutoring" varchar DEFAULT 'One-to-one tutoring is available for pupils who need extra support in a subject.';
  ALTER TABLE "site_settings" ADD COLUMN "quotes_closing_text" varchar DEFAULT 'Up, you mighty race, for you can accomplish what you will.';
  ALTER TABLE "site_settings" ADD COLUMN "quotes_closing_attribution" varchar DEFAULT 'The Honourable Marcus Mosiah Garvey';`)
}
