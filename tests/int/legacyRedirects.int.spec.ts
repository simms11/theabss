import { describe, expect, it } from 'vitest'

import { LEGACY_PAGES, legacyRedirects } from '../../src/lib/legacyRedirects'

/** The legacy .html addresses that must keep working. */
const LEGACY_ADDRESSES = [
  '/form-downloads.html',
  '/abss-trips.html',
  '/about-us.html',
  '/sports.html',
  '/educational-services.html',
  '/index.html',
  '/school-life.html',
  '/payment.html',
  '/contact-us.html',
  '/finances.html',
  '/arts-and-events.html',
  '/social-media-links.html',
  '/school-life1.html',
]

describe('legacy address redirects', () => {
  const rules = legacyRedirects()

  it('covers every legacy address', () => {
    for (const path of LEGACY_ADDRESSES) expect(LEGACY_PAGES[path], path).toBeTruthy()
  })

  it('redirects permanently, so search engines move their listings', () => {
    expect(rules.every((rule) => rule.permanent)).toBe(true)
  })

  it('sends each one to a clean address on this site', () => {
    for (const destination of Object.values(LEGACY_PAGES)) {
      expect(destination).toMatch(/^\/[a-z-]*$/)
    }
  })

  // Next uses the first rule that matches, so the catch-all must come last or
  // /about-us.html would go to /about-us instead of /about.
  it('puts the specific pages before the catch-all', () => {
    const catchAll = rules.findIndex((rule) => rule.source.includes(':slug'))
    expect(catchAll).toBe(rules.length - 1)
  })
})
