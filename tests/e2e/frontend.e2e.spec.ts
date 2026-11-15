import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { removeEnquiriesFrom } from '../helpers/enquiries'

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// The last three are created by `pnpm seed`, which CI runs before these tests.
const SEEDED_PAGES = ['/about', '/educational-services', '/school-life']
const PUBLIC_PAGES = [
  '/',
  '/events',
  '/contact',
  '/payment',
  '/forms',
  '/styleguide',
  ...SEEDED_PAGES,
]

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

  test('home page says what the school teaches, subject by subject', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section', {
      has: page.getByRole('heading', { name: 'What we teach', level: 2 }),
    })
    for (const subject of ['African History', 'English', 'Maths', 'Science']) {
      await expect(section.getByRole('heading', { name: subject, level: 3 })).toBeVisible()
    }
  })

  // Quotes are marked up as quotations with their source, not as styled headings.
  test('home page carries the school’s quotes, each with its attribution', async ({ page }) => {
    await page.goto('/')
    const quotes = page.locator('figure:has(blockquote)')
    await expect(quotes).toHaveCount(2)
    await expect(quotes.first().locator('blockquote')).toContainText('like a tree without roots')
    await expect(quotes.first().locator('figcaption')).toContainText('Marcus Mosiah Garvey')
  })

  test('the phone menu opens, marks the current page and closes after a link is followed', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/events')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav).toBeHidden()

    await page.locator('header summary').click()
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Events' })).toHaveAttribute('aria-current', 'page')

    await nav.getByRole('link', { name: 'Contact' }).click()
    await expect(page).toHaveURL(/\/contact$/)
    await expect(nav).toBeHidden()

    // Escape closes it and returns focus to the button.
    await page.locator('header summary').click()
    await expect(nav).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(nav).toBeHidden()
    await expect(page.locator('header summary')).toBeFocused()

    // Open, it must still pass the accessibility checks.
    await page.locator('header summary').click()
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })

  test('contact page says where the school is, how to get there and where to follow it', async ({
    page,
  }) => {
    await page.goto('/contact')
    const visit = page.getByRole('complementary')
    await expect(visit.getByRole('heading', { name: 'Visit us' })).toBeVisible()
    await expect(visit.getByText('City Heights E-ACT Academy')).toBeVisible()
    await expect(visit.getByText(/Buses: 2, 201, 415, 432 and 468/)).toBeVisible()
    await expect(visit.getByRole('link', { name: 'Get directions' })).toBeVisible()
    await expect(visit.locator('iframe')).toHaveAttribute('title', /Map showing/)
    await expect(visit.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/abss20201/',
    )
    await expect(visit.getByRole('link', { name: 'X (Twitter)' })).toHaveAttribute(
      'href',
      'https://x.com/ABSS_UK',
    )
  })

  // Privacy and speed: nothing from YouTube's player loads unless someone presses play.
  test('videos load only when played', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section', {
      has: page.getByRole('heading', { name: 'See the school in action', level: 2 }),
    })
    const play = section.getByRole('button', { name: /^Play video: / })
    await expect(play).toHaveCount(3)
    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0)

    await play.first().click()
    const player = section.locator('iframe')
    await expect(player).toHaveCount(1)
    await expect(player).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\//)
    await expect(player).toHaveAttribute('title', /.+/)
    await expect(play).toHaveCount(2)
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
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
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
      // On a phone the links are behind one Menu button, so the header is a single row.
      const menu = page.locator('header summary')
      expect((await menu.boundingBox())?.height, 'menu button height').toBeGreaterThanOrEqual(44)
      expect((await page.locator('header').boundingBox())?.height, 'header height').toBeLessThan(90)
      await menu.click()
      const links = page.getByRole('navigation', { name: 'Main' }).getByRole('link')
      expect(await links.count()).toBeGreaterThanOrEqual(3)
      for (const link of await links.all()) {
        const box = await link.boundingBox()
        expect(box?.height, 'tap target height').toBeGreaterThanOrEqual(44)
      }
    })
  }

  test('the school’s core pages are in the menu and carry their quotes', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Main' })
    for (const name of ['About', 'Educational Services', 'School Life', 'Contact']) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible()
    }

    const quotes = {
      '/about': 'passport to the future',
      '/educational-services': 'like a tree without roots',
      '/school-life': 'kill the revolution',
    }
    for (const [path, words] of Object.entries(quotes)) {
      await page.goto(path)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('blockquote').first()).toContainText(words)
    }
  })

  test('a legacy .html address lands on a real page, not a 404', async ({ page }) => {
    const response = await page.goto('/about-us.html')
    expect(response?.status()).toBe(200)
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About')
  })

  test('fees and payment page gives the price first, then the full table, then how to pay', async ({
    page,
  }) => {
    await page.goto('/payment')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fees and payment')
    await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveText([
      'Weekly fees',
      'How to pay',
    ])
    await expect(page.getByText('From £13')).toBeVisible()

    // A real table: a screen reader announces each amount with its row and column.
    const table = page.getByRole('table')
    await expect(table.getByRole('columnheader')).toHaveText([
      'Children',
      'Parent not working',
      'Parent working part time',
      'Parent working full time',
    ])
    await expect(table.getByRole('rowheader')).toHaveText([
      '1 child',
      '2 children',
      '3 children',
      '4 children',
    ])
    await expect(table.getByRole('row', { name: /2 children/ }).getByRole('cell')).toHaveText([
      '£19',
      '£21',
      '£23',
    ])

    // No payment details are set in a fresh database, so the page points to the contact form.
    await expect(page.getByRole('main').getByRole('link', { name: 'Contact us' })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  test('home page shows the cost in the key facts, linked to the fees', async ({ page }) => {
    await page.goto('/')
    const facts = page.locator('section', { has: page.getByRole('heading', { name: 'Key facts' }) })
    await expect(facts.getByText('From £13 a week')).toBeVisible()
    await expect(facts.getByRole('link', { name: 'See all fees' })).toHaveAttribute(
      'href',
      '/payment',
    )
  })

  test.describe('contact form', () => {
    const parent = `E2E Parent ${Date.now()}`

    test.afterAll(async () => {
      await removeEnquiriesFrom(parent)
    })

    test('lists what to fix, links each problem to its field, and keeps what was typed', async ({
      page,
    }) => {
      await page.goto('/contact')
      await page.getByLabel('Your name').fill(parent)
      await page.getByRole('button', { name: 'Send message' }).click()

      const summary = page.getByRole('alert', { name: 'There is a problem' })
      await expect(summary).toBeFocused()
      await expect(summary.getByRole('heading', { name: 'There is a problem' })).toBeVisible()
      await expect(summary.getByRole('link')).toHaveText([
        'Select what your message is about',
        'Enter your email address',
        'Enter your message',
      ])
      await expect(page.getByLabel('Your name')).toHaveValue(parent)

      const email = page.getByLabel('Email address')
      await expect(email).toHaveAttribute('aria-invalid', 'true')
      await summary.getByRole('link', { name: 'Enter your email address' }).click()
      await expect(email).toBeFocused()

      // The error state must be as accessible as the empty form.
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
    })

    test('sends a complete message and confirms it', async ({ page }) => {
      await page.goto('/contact')
      await page.getByLabel('A place for my child').check()
      await page.getByLabel('Your name').fill(parent)
      await page.getByLabel('Email address').fill('parent@example.com')
      await page.getByLabel('Your child’s age (optional)').selectOption('8-11')
      await page.getByLabel('Your message').fill('Do you have a place for a nine year old?')
      await page.getByRole('button', { name: 'Send message' }).click()

      const confirmation = page.getByRole('status')
      await expect(confirmation.getByRole('heading', { name: 'Message sent' })).toBeVisible()
      await expect(confirmation).toBeFocused()
      await expect(page.getByRole('button', { name: 'Send message' })).toHaveCount(0)
    })
  })

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
