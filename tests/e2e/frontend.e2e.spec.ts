import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PUBLIC_PAGES = ['/', '/events', '/styleguide']

test.describe('Frontend', () => {
  test('home page has a real title, one main heading, landmarks and a skip link', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Afruika Bantu Saturday School/)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  })

  // The address is text first (copyable, searchable, read aloud); the map is an extra.
  test('home page shows where the school is, as text and on a map', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section', {
      has: page.getByRole('heading', { name: 'Find us', level: 2 }),
    })
    await expect(section.getByText('City Heights E-ACT Academy')).toBeVisible()
    await expect(section.getByText(/SW2 3PW/)).toBeVisible()
    await expect(section.getByRole('link', { name: 'Get directions' })).toHaveAttribute(
      'href',
      /^https:\/\/www\.google\.com\/maps\/dir\//,
    )
    const map = section.locator('iframe')
    await expect(map).toHaveAttribute('title', /Map showing City Heights E-ACT Academy/)
    await expect(map).toHaveAttribute('src', /^https:\/\/www\.google\.com\/maps\?q=/)
  })

  test('the menu marks the current page', async ({ page }) => {
    await page.goto('/events')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link', { name: 'Events' })).toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  // WCAG 2.2 AA, checked automatically on every page. Automated checks catch only part of
  // what matters, so a keyboard and screen-reader pass is still needed before launch.
  for (const path of PUBLIC_PAGES) {
    test(`${path} has no automatically detectable accessibility problems`, async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
    })
  }

  for (const path of PUBLIC_PAGES) {
    test(`${path} fits a phone with tappable menu links`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
      expect(overflow, 'horizontal scroll').toBeLessThanOrEqual(0)
      for (const link of await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link')
        .all()) {
        const box = await link.boundingBox()
        expect(box?.height, 'tap target height').toBeGreaterThanOrEqual(44)
      }
    })
  }

  test('a legacy .html address redirects permanently to its current page', async ({ request }) => {
    const response = await request.get('/about-us.html', { maxRedirects: 0 })
    expect(response.status()).toBe(308)
    expect(response.headers()['location']).toBe('/about')
  })

  test('pages are sent with security headers', async ({ request }) => {
    const headers = (await request.get('/')).headers()
    expect(headers['content-security-policy']).toContain("default-src 'self'")
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['strict-transport-security']).toContain('max-age=')
  })

  test('an unknown address shows the site’s own not-found page', async ({ page }) => {
    const response = await page.goto('/no-such-page')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/couldn’t find that page/)
  })
})
