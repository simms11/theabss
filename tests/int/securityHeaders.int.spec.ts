import { describe, expect, it } from 'vitest'

import {
  contentSecurityPolicy,
  parseFrameAncestors,
  securityHeaderRules,
  securityHeaders,
} from '../../src/lib/securityHeaders'

const PROD = { NODE_ENV: 'production' }
const PROD_WITH_MEDIA = {
  ...PROD,
  S3_BUCKET: 'abss-media',
  S3_REGION: 'eu-west-2',
  MEDIA_CDN_URL: 'https://d111111abcdef8.cloudfront.net',
}

const toMap = (list: { key: string; value: string }[]) =>
  Object.fromEntries(list.map((h) => [h.key.toLowerCase(), h.value]))

const parseCsp = (value: string): Record<string, string[]> =>
  Object.fromEntries(
    value.split('; ').map((d) => {
      const [name, ...values] = d.split(' ')
      return [name, values]
    }),
  )

const headers = toMap(securityHeaders([], PROD))
const csp = parseCsp(contentSecurityPolicy([], PROD))
const cspWithMedia = parseCsp(contentSecurityPolicy([], PROD_WITH_MEDIA))

/** The headers Next sends for a path: every matching rule applies, later rules win per key. */
const headersFor = (path: string, frameAncestorsEnv?: string) => {
  const matches = (source: string) =>
    source === '/(.*)' ||
    path === source.replace('/:path*', '') ||
    path.startsWith(source.replace(':path*', ''))
  return securityHeaderRules(frameAncestorsEnv, PROD)
    .filter((rule) => matches(rule.source))
    .reduce<Record<string, string>>((acc, rule) => ({ ...acc, ...toMap(rule.headers) }), {})
}

describe('security headers', () => {
  it('sends the baseline headers', () => {
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })

  // HSTS for this host only. includeSubDomains would force HTTPS on every subdomain of the
  // school's domain for two years, and preload asks browsers to hard-code it.
  it('forces HTTPS on this host without committing the whole domain', () => {
    const hsts = headers['strict-transport-security']
    expect(hsts).toMatch(/max-age=\d+/)
    expect(hsts).not.toMatch(/includeSubDomains/i)
    expect(hsts).not.toMatch(/preload/i)
  })

  it('only lets this site load scripts, and blocks plugins, framing and foreign forms', () => {
    expect(csp['default-src']).toEqual(["'self'"])
    expect(csp['script-src']).toEqual(["'self'", "'unsafe-inline'"])
    expect(csp['object-src']).toEqual(["'none'"])
    expect(csp['frame-ancestors']).toEqual(["'self'"])
    expect(csp['form-action']).toEqual(["'self'"])
    expect(csp['base-uri']).toEqual(["'self'"])
  })

  it('embeds video only from YouTube’s no-cookie player', () => {
    expect(csp['frame-src']).toEqual(['https://www.youtube-nocookie.com'])
    expect(csp['img-src']).toContain('https://i.ytimg.com')
  })

  describe('media storage', () => {
    it('names no storage host until one is configured', () => {
      expect(csp['connect-src']).toEqual(["'self'"])
      expect(
        csp['img-src'].filter((s) => s.includes('cloudfront') || s.includes('amazonaws')),
      ).toEqual([])
    })

    it('loads images from the CDN, never straight from the bucket', () => {
      expect(cspWithMedia['img-src']).toContain('https://d111111abcdef8.cloudfront.net')
      expect(cspWithMedia['img-src'].some((s) => s.includes('amazonaws.com'))).toBe(false)
    })

    it('lets the admin upload to this bucket only, not all of S3', () => {
      expect(cspWithMedia['connect-src']).toEqual([
        "'self'",
        'https://abss-media.s3.eu-west-2.amazonaws.com',
      ])
    })

    it('ignores a CDN address that could inject extra policy', () => {
      const injected = contentSecurityPolicy([], {
        ...PROD,
        MEDIA_CDN_URL: "https://cdn.example.com; script-src 'unsafe-eval'",
      })
      expect(injected).not.toContain('unsafe-eval')
      expect(injected).not.toContain('cdn.example.com')
    })
  })

  // A portfolio's live-demo window may frame the public pages, never the admin or the API.
  describe('FRAME_ANCESTORS', () => {
    const portfolio = 'https://portfolio.example.com'

    it('accepts only https origins, so nothing else can be injected into the header', () => {
      expect(
        parseFrameAncestors(`${portfolio}, http://plain.example.com https://x.example.com/path *`),
      ).toEqual([portfolio])
      expect(parseFrameAncestors("https://a.example.com; script-src 'unsafe-eval'")).toEqual([])
      expect(parseFrameAncestors(undefined)).toEqual([])
    })

    it('lets the named site frame public pages', () => {
      for (const path of ['/', '/events', '/about']) {
        const sent = headersFor(path, portfolio)
        expect(parseCsp(sent['content-security-policy'])['frame-ancestors']).toEqual([
          "'self'",
          portfolio,
        ])
        expect(sent['x-frame-options']).toBeUndefined()
      }
    })

    it('keeps the admin and the API locked to this site', () => {
      for (const path of [
        '/admin',
        '/admin/login',
        '/admin/collections/users',
        '/api/users/login',
      ]) {
        const sent = headersFor(path, portfolio)
        expect(parseCsp(sent['content-security-policy'])['frame-ancestors']).toEqual(["'self'"])
        expect(sent['x-frame-options']).toBe('SAMEORIGIN')
      }
    })

    it('locks every page when it is not set', () => {
      for (const path of ['/', '/events', '/admin']) {
        expect(headersFor(path)['x-frame-options']).toBe('SAMEORIGIN')
      }
    })
  })
})
