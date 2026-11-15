import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { publishEvent, removeEvents, signIn } from '../helpers/events'

const P = `EVT${Date.now()}`
const slug = (name: string) => `${P}-${name}`.toLowerCase()

// Other test files expect an empty events list, so this file must not run beside them.
test.describe.configure({ mode: 'serial' })

test.describe('Events', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    token = await signIn(request)
    const common = { venue: 'Example Arena', address: '1 Example Road\nLondon SW2' }
    await publishEvent(request, token, {
      ...common,
      title: `${P} museum trip`,
      slug: slug('trip'),
      type: 'trip',
      start: '2030-05-11T09:00:00.000Z',
      summary: 'A whole-school trip.',
    })
    await publishEvent(request, token, {
      ...common,
      title: `${P} sports day`,
      slug: slug('sports'),
      type: 'sports',
      start: '2030-07-13T09:30:00.000Z',
      end: '2030-07-13T16:00:00.000Z',
      summary: 'A family sports day.',
      price: 'Free',
    })
    await publishEvent(request, token, {
      ...common,
      title: `${P} winter show`,
      slug: slug('show'),
      type: 'performance',
      start: '2020-12-12T14:00:00.000Z',
      summary: 'Pupils perform.',
    })
  })

  test.afterAll(async ({ request }) => {
    await removeEvents(request, token, P)
  })

  const mine = (page: import('@playwright/test').Page) =>
    page.locator('article', { hasText: P }).locator('h3')

  test('lists upcoming events soonest first, and finished ones under past events', async ({
    page,
  }) => {
    await page.goto('/events')
    const upcoming = page.locator('section', {
      has: page.getByRole('heading', { name: 'Coming up' }),
    })
    await expect(upcoming.locator('article', { hasText: P }).locator('h3')).toHaveText([
      `${P} museum trip`,
      `${P} sports day`,
    ])
    const past = page.locator('section', {
      has: page.getByRole('heading', { name: 'Past events' }),
    })
    await expect(past.getByRole('heading', { name: `${P} winter show` })).toBeVisible()
    // Dates are London time: 09:30 UTC in July is 10:30am.
    await expect(upcoming.getByText('Saturday 13 July 2030, 10:30am to 5pm')).toBeVisible()
  })

  test('filters by type, says how many match, and keeps the choice in the address', async ({
    page,
  }) => {
    await page.goto('/events')
    const filters = page.getByRole('group', { name: 'Filter events by type' })
    const trips = filters.getByRole('button', { name: 'Trips' })
    await expect(trips).toHaveAttribute('aria-pressed', 'false')

    await trips.click()
    await expect(page).toHaveURL(/\/events\?type=trip$/)
    await expect(trips).toHaveAttribute('aria-pressed', 'true')
    await expect(mine(page)).toHaveText([`${P} museum trip`])
    await expect(page.getByRole('status')).toContainText(/Showing \d+ events? in trips/)

    await filters.getByRole('button', { name: 'All events' }).click()
    await expect(page).toHaveURL(/\/events$/)
    await expect(mine(page)).toHaveCount(3)
  })

  test('a filtered address can be opened directly, including a legacy one', async ({ page }) => {
    await page.goto('/events?type=performance')
    await expect(mine(page)).toHaveText([`${P} winter show`])

    await page.goto('/sports.html')
    await expect(page).toHaveURL(/\/events\?type=sports$/)
    await expect(mine(page)).toHaveText([`${P} sports day`])
  })

  test('an upcoming event can be added to a calendar', async ({ page, request }) => {
    await page.goto('/events')
    const link = page.getByRole('link', { name: `Add to calendar for ${P} sports day` })
    await expect(link).toHaveAttribute('href', `/events/${slug('sports')}/calendar.ics`)

    const file = await request.get(`/events/${slug('sports')}/calendar.ics`)
    expect(file.headers()['content-type']).toContain('text/calendar')
    const body = await file.text()
    expect(body).toContain(`SUMMARY:${P} sports day`)
    expect(body).toContain('DTSTART:20300713T093000Z')
    expect(body).toContain('LOCATION:Example Arena')

    expect((await request.get('/events/no-such-event/calendar.ics')).status()).toBe(404)
  })

  test('the calendar feed holds upcoming events only', async ({ request }) => {
    const body = await (await request.get('/events/calendar.ics')).text()
    expect(body).toContain(`${P} museum trip`)
    expect(body).toContain(`${P} sports day`)
    expect(body).not.toContain(`${P} winter show`)
  })

  test('upcoming events are described to search engines', async ({ page }) => {
    await page.goto('/events')
    const data = await page.locator('script[type="application/ld+json"]').first().textContent()
    const events = JSON.parse(data ?? '[]') as Array<Record<string, unknown>>
    const sports = events.find((event) => event.name === `${P} sports day`)
    expect(sports).toMatchObject({ '@type': 'Event', startDate: '2030-07-13T09:30:00.000Z' })
    expect(events.some((event) => event.name === `${P} winter show`)).toBe(false)
  })

  test('the events page with events and filters has no accessibility problems', async ({
    page,
  }) => {
    await page.goto('/events?type=sports')
    await expect(mine(page)).toHaveCount(1)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
