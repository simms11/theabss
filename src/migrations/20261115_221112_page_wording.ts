import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "page_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"home_hero_label" varchar DEFAULT 'Saturday school in South London',
  	"invitation_heading" varchar DEFAULT 'Would you like a place for your child?' NOT NULL,
  	"invitation_text" varchar DEFAULT 'Tell us your child’s age and we’ll reply by email. You’re welcome to visit on a Saturday first.',
  	"intros_events" varchar DEFAULT 'Open days, performances, sports days and trips. Families and the wider community are welcome.',
  	"intros_contact" varchar DEFAULT 'Ask about a place for your child, volunteering, or anything else. We’ll reply by email.',
  	"intros_forms" varchar DEFAULT 'The application form, school rules, policies and guides for parents and carers.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "page_content" CASCADE;`)
}
