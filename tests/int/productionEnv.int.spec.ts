import { describe, expect, it } from 'vitest'

import {
  mediaCdnOrigin,
  mediaFileUrl,
  s3Enabled,
  s3Endpoint,
  s3Region,
  s3UploadOrigin,
} from '../../src/lib/mediaStorage'
import { productionEnvProblems } from '../../src/lib/productionEnv'

const complete = {
  VERCEL_ENV: 'production',
  DATABASE_URL: 'postgres://u:p@db.example.com/abss',
  PAYLOAD_SECRET: 'x'.repeat(32),
  NEXT_PUBLIC_SERVER_URL: 'https://www.theabss.org',
  CRON_SECRET: 'cron-secret',
  RESEND_API_KEY: 're_test',
  CONTACT_EMAIL: 'school@example.com',
  S3_BUCKET: 'abss-media',
  S3_ENDPOINT: 'https://0123456789abcdef.r2.cloudflarestorage.com',
  S3_ACCESS_KEY_ID: 'id',
  S3_SECRET_ACCESS_KEY: 'secret',
  MEDIA_CDN_URL: 'https://media.example.org',
}

describe('production settings', () => {
  it('accepts a complete production environment', () => {
    expect(productionEnvProblems(complete)).toEqual([])
  })

  it('is not checked outside a production deploy', () => {
    expect(productionEnvProblems({})).toEqual([])
    expect(productionEnvProblems({ VERCEL_ENV: 'preview' })).toEqual([])
  })

  // Without storage, uploads would go to Vercel's temporary disk and vanish on the next deploy.
  it('refuses to deploy without media storage', () => {
    const problems = productionEnvProblems({ ...complete, S3_BUCKET: '', MEDIA_CDN_URL: '' })
    expect(problems.join(' ')).toMatch(/S3_BUCKET, MEDIA_CDN_URL not set/)
  })

  // A form that saves messages nobody is told about, or keeps them for ever, is worse than none.
  it('refuses to deploy without enquiry notifications or the deletion job', () => {
    expect(productionEnvProblems({ ...complete, CONTACT_EMAIL: '' }).join(' ')).toMatch(
      /never told about enquiries/,
    )
    expect(productionEnvProblems({ ...complete, CRON_SECRET: '' }).join(' ')).toMatch(
      /never be deleted/,
    )
  })

  it('refuses a short secret, a non-https site address or a malformed CDN address', () => {
    expect(productionEnvProblems({ ...complete, PAYLOAD_SECRET: 'short' })).toHaveLength(1)
    expect(
      productionEnvProblems({ ...complete, NEXT_PUBLIC_SERVER_URL: 'http://theabss.org' }),
    ).toHaveLength(1)
    expect(
      productionEnvProblems({ ...complete, MEDIA_CDN_URL: 'https://cdn.example.com/' }),
    ).toHaveLength(1)
  })
})

describe('storage service', () => {
  it('works with Cloudflare R2: its own endpoint, the bucket in the path, region "auto"', () => {
    expect(s3Endpoint(complete)).toBe('https://0123456789abcdef.r2.cloudflarestorage.com')
    expect(s3Region(complete)).toBe('auto')
    expect(s3UploadOrigin(complete)).toBe('https://0123456789abcdef.r2.cloudflarestorage.com')
  })

  it('works with Amazon S3 when no endpoint is set', () => {
    const aws = { S3_BUCKET: 'abss-media', S3_REGION: 'eu-west-2' }
    expect(s3Endpoint(aws)).toBeNull()
    expect(s3Region(aws)).toBe('eu-west-2')
    expect(s3UploadOrigin(aws)).toBe('https://abss-media.s3.eu-west-2.amazonaws.com')
  })

  it('refuses a deploy whose endpoint is not a plain https address', () => {
    expect(
      productionEnvProblems({ ...complete, S3_ENDPOINT: 'https://example.com/bucket' }),
    ).toHaveLength(1)
  })
})

describe('media storage', () => {
  it('is off until a bucket is configured, so development uses local disk', () => {
    expect(s3Enabled({})).toBe(false)
    expect(s3Enabled(complete)).toBe(true)
  })

  it('serves files from the CDN, under the media folder', () => {
    expect(mediaFileUrl('sports day.webp', 'media', complete)).toBe(
      'https://media.example.org/media/sports%20day.webp',
    )
  })

  it('rejects a CDN address that is not a plain https origin', () => {
    expect(mediaCdnOrigin({ MEDIA_CDN_URL: 'http://cdn.example.com' })).toBeNull()
    expect(mediaCdnOrigin({ MEDIA_CDN_URL: 'https://cdn.example.com/path' })).toBeNull()
  })
})
