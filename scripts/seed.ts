/**
 * Seeds the first admin user and the school's core pages (About,
 * Educational Services, School Life, Privacy). Idempotent: safe to run more than once, never
 * overwrites, so re-running it can't undo an editor's changes.
 *
 *   pnpm seed                                    # local: development defaults
 *   NODE_ENV=production SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... DATABASE_URL=... pnpm seed
 *
 * A hosted database is refused unless it's production mode with a real email and strong
 * password (scripts/lib/seedPreflight.ts).
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config'

import { PAGES } from './content/pages'
import { toLexical } from './lib/lexical'
import { DEFAULT_PASSWORD, seedPreflight } from './lib/seedPreflight'

async function seed() {
  // Before connecting: a push or a default login must never reach a hosted database.
  const problems = seedPreflight(process.env)
  if (problems.length) {
    console.error(`pnpm seed refused:\n- ${problems.join('\n- ')}`)
    process.exit(1)
  }
  const payload = await getPayload({ config })

  const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@abss.localhost').toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD
  const users = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email, password, name: 'Site Admin', role: 'admin' },
      context: { disableRevalidate: true },
    })
    payload.logger.info(`Created admin user ${email} — change the password after first login.`)
  }

  // The school's core pages, published and linked from the main menu or the footer. A page that exists (even as a draft) is left alone.
  for (const page of PAGES) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      draft: true,
    })
    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'pages',
        data: {
          title: page.title,
          slug: page.slug,
          intro: page.intro,
          content: toLexical(page.content) as never,
          navigation: page.navigation ?? 'header',
          order: page.order,
          _status: 'published',
        },
        context: { disableRevalidate: true },
      })
      payload.logger.info(`Created page: ${page.title} (/${page.slug})`)
    }
  }

  payload.logger.info('Seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
