/**
 * Legacy `.html` addresses, each sent permanently to its current page. Search results, the
 * school's social posts and printed flyers point at these, so none may 404.
 *
 * Any other ".html" address falls through to the catch-all, which drops the extension.
 */
export const LEGACY_PAGES: Record<string, string> = {
  '/index.html': '/',
  '/about-us.html': '/about',
  '/contact-us.html': '/contact',
  '/educational-services.html': '/educational-services',
  '/school-life.html': '/school-life',
  '/school-life1.html': '/school-life',
  '/abss-trips.html': '/events?type=trip',
  '/sports.html': '/events?type=sports',
  '/arts-and-events.html': '/events?type=performance',
  '/finances.html': '/payment',
  '/form-downloads.html': '/forms',
  '/payment.html': '/payment',
  '/social-media-links.html': '/contact',
}

/** Rules for next.config.ts redirects(). Specific pages first: Next uses the first match. */
export const legacyRedirects = () => [
  ...Object.entries(LEGACY_PAGES).map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  })),
  { source: '/:slug([a-z0-9-]+).html', destination: '/:slug', permanent: true },
]
