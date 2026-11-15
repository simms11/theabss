/**
 * Seeds the first admin user and saves Site Settings with their defaults.
 * Idempotent: safe to run more than once, never overwrites.
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

  payload.logger.info('Seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
