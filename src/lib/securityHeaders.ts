import { mediaCdnOrigin, s3UploadOrigin } from './mediaStorage'
import { TURNSTILE_ORIGIN, turnstileSiteKey } from './turnstile'

/**
 * Security headers for every response, set from next.config.ts so they apply wherever the
 * app runs (and can be tested locally), not only on Vercel.
 *
 * CSP: Next's statically generated pages need inline scripts, so script-src keeps
 * 'unsafe-inline'. A nonce-based policy would force every page to render on demand and lose
 * static speed, a poor trade for a brochure site. Everything else is locked to this site plus
 * three named exceptions:
 *  - the media CDN (CloudFront), for images;
 *  - the S3 bucket's own address, only for the admin's direct uploads;
 *  - YouTube's no-cookie player and its thumbnails, for the school's videos;
 *  - Google Maps, framed only, for the map showing where the school is;
 *  - Cloudflare Turnstile, the contact form's human check, only when its keys are set.
 * Dev mode adds what Next's hot reload needs.
 *
 * Framing: only this site may frame its pages, except that FRAME_ANCESTORS can name extra
 * https origins (such as a portfolio's live-demo window) allowed to frame the public pages.
 * /admin and /api always stay locked to this site, so the login can't be clickjacked.
 */
type Env = Record<string, string | undefined>

export const YOUTUBE_PLAYER = 'https://www.youtube-nocookie.com'
export const YOUTUBE_THUMBNAILS = 'https://i.ytimg.com'
export const GOOGLE_MAPS = 'https://www.google.com'

/** The https origins in FRAME_ANCESTORS (space or comma separated); anything else is ignored. */
export const parseFrameAncestors = (value = ''): string[] =>
  value
    .split(/[\s,]+/)
    .filter((origin) => /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?$/i.test(origin))

const list = (...values: Array<string | null | false>) => values.filter(Boolean).join(' ')

export const contentSecurityPolicy = (frameAncestors: string[] = [], env: Env = process.env) => {
  const isDev = env.NODE_ENV !== 'production'
  const cdn = mediaCdnOrigin(env)
  const turnstile = turnstileSiteKey(env) ? TURNSTILE_ORIGIN : null
  return [
    "default-src 'self'",
    list("script-src 'self' 'unsafe-inline'", turnstile, isDev && "'unsafe-eval'"),
    "style-src 'self' 'unsafe-inline'",
    list("img-src 'self' data: blob:", cdn, YOUTUBE_THUMBNAILS),
    "font-src 'self' data:",
    list("connect-src 'self'", s3UploadOrigin(env), isDev && 'ws: wss:'),
    list("media-src 'self'", cdn),
    list(`frame-src ${YOUTUBE_PLAYER} ${GOOGLE_MAPS}`, turnstile),
    ["frame-ancestors 'self'", ...frameAncestors].join(' '),
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

/**
 * Headers for one route group. X-Frame-Options can't name another site, so it is only sent
 * when nothing else may frame the page; CSP frame-ancestors does the job in modern browsers.
 */
export const securityHeaders = (frameAncestors: string[] = [], env: Env = process.env) => [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy(frameAncestors, env) },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  ...(frameAncestors.length === 0 ? [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }] : []),
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // This host only. includeSubDomains would force HTTPS on every subdomain of theabss.org,
  // including anything the school's email provider uses, for two years.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
]

/** Locked to this site whatever FRAME_ANCESTORS says. */
export const LOCKED_ROUTES = ['/admin/:path*', '/api/:path*']

/**
 * The rules for next.config.ts headers(). When two rules set the same header on a path, Next
 * uses the later one, so the locked routes override the public rule.
 */
export const securityHeaderRules = (frameAncestorsEnv?: string, env: Env = process.env) => [
  { source: '/(.*)', headers: securityHeaders(parseFrameAncestors(frameAncestorsEnv), env) },
  ...LOCKED_ROUTES.map((source) => ({ source, headers: securityHeaders([], env) })),
]
