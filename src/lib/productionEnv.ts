/**
 * Settings a real production deploy can't run without. Checked when the Payload config loads,
 * so a missing value fails the deploy loudly instead of failing quietly later (uploads saved
 * to Vercel's temporary disk and lost, insecure sessions).
 * Only real production deploys on Vercel are checked; local, CI and preview builds are not.
 */
const MEDIA_SETTINGS = [
  'S3_BUCKET',
  'S3_REGION',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'MEDIA_CDN_URL',
] as const

export const productionEnvProblems = (env: Record<string, string | undefined>): string[] => {
  if (env.VERCEL_ENV !== 'production') return []
  const problems: string[] = []
  if (!env.DATABASE_URL) problems.push('DATABASE_URL is not set.')
  if ((env.PAYLOAD_SECRET ?? '').length < 32) {
    problems.push('PAYLOAD_SECRET must be set to a random value of at least 32 characters.')
  }
  if (!env.CRON_SECRET) {
    problems.push('CRON_SECRET is not set, so old enquiries would never be deleted.')
  }
  if (!env.RESEND_API_KEY || !(env.CONTACT_EMAIL ?? '').includes('@')) {
    problems.push(
      'RESEND_API_KEY and CONTACT_EMAIL must be set, or the school is never told about enquiries.',
    )
  }
  const missingMedia = MEDIA_SETTINGS.filter((name) => !env[name])
  if (missingMedia.length) {
    problems.push(
      `${missingMedia.join(', ')} not set, so uploads would be lost on the next deploy.`,
    )
  }
  if (env.MEDIA_CDN_URL && !/^https:\/\/[^/]+$/.test(env.MEDIA_CDN_URL)) {
    problems.push('MEDIA_CDN_URL must be an https:// address with no trailing slash.')
  }
  if (!env.NEXT_PUBLIC_SERVER_URL?.startsWith('https://')) {
    problems.push('NEXT_PUBLIC_SERVER_URL must be the live https:// address.')
  }
  return problems
}

export const assertProductionEnv = (env: Record<string, string | undefined> = process.env) => {
  const problems = productionEnvProblems(env)
  if (problems.length) {
    throw new Error(`Production settings are incomplete:\n- ${problems.join('\n- ')}`)
  }
}
