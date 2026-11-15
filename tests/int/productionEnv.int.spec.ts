import { describe, expect, it } from 'vitest'

import { mediaCdnOrigin, mediaFileUrl, s3Enabled } from '../../src/lib/mediaStorage'
import { productionEnvProblems } from '../../src/lib/productionEnv'

const complete = {
  VERCEL_ENV: 'production',
  DATABASE_URL: 'postgres://u:p@db.example.com/abss',
  PAYLOAD_SECRET: 'x'.repeat(32),
  NEXT_PUBLIC_SERVER_URL: 'https://www.theabss.org',
  S3_BUCKET: 'abss-media',
  S3_REGION: 'eu-west-2',
  S3_ACCESS_KEY_ID: 'id',
  S3_SECRET_ACCESS_KEY: 'secret',
  MEDIA_CDN_URL: 'https://d111111abcdef8.cloudfront.net',
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

describe('media storage', () => {
  it('is off until a bucket is configured, so development uses local disk', () => {
    expect(s3Enabled({})).toBe(false)
    expect(s3Enabled(complete)).toBe(true)
  })

  it('serves files from the CDN, under the media folder', () => {
    expect(mediaFileUrl('sports day.webp', 'media', complete)).toBe(
      'https://d111111abcdef8.cloudfront.net/media/sports%20day.webp',
    )
  })

  it('rejects a CDN address that is not a plain https origin', () => {
    expect(mediaCdnOrigin({ MEDIA_CDN_URL: 'http://cdn.example.com' })).toBeNull()
    expect(mediaCdnOrigin({ MEDIA_CDN_URL: 'https://cdn.example.com/path' })).toBeNull()
  })
})
