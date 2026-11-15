import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import sharp from 'sharp'

import { publishEvent, signIn, signOut } from '../helpers/events'

const P = `GAL${Date.now()}`
const COLOURS = ['#a32a2a', '#e0b43a', '#2f7d32', '#14110f', '#efe7d8']

test.describe('Photo gallery', () => {
  let token: string
  const auth = () => ({ Authorization: `JWT ${token}` })

  test.beforeAll(async ({ request }) => {
    token = await signIn(request, 'gallery')
    const ids: number[] = []
    for (const [index, colour] of COLOURS.entries()) {
      const buffer = await sharp({
        create: { width: 640, height: 480, channels: 3, background: colour },
      })
        .png()
        .toBuffer()
      const response = await request.post('/api/media', {
        headers: auth(),
        multipart: {
          file: { name: `${P}-${index}.png`, mimeType: 'image/png', buffer },
          _payload: JSON.stringify({
            alt: `${P} picture ${index + 1}`,
            showsChildren: 'no',
          }),
        },
      })
      if (!response.ok()) throw new Error(`Could not upload: ${await response.text()}`)
      ids.push(((await response.json()) as { doc: { id: number } }).doc.id)
    }
    await publishEvent(request, token, {
      title: `${P} summer show`,
      slug: `${P}-show`.toLowerCase(),
      type: 'performance',
      start: '2021-07-10T13:00:00.000Z',
      venue: 'Example Hall',
      summary: 'Pupils perform.',
      flyer: ids[0],
      photos: ids,
    })
  })

  test.afterAll(async ({ request }) => {
    await request.delete(`/api/events?where[title][contains]=${P}`, { headers: auth() })
    await request.delete(`/api/media?where[alt][contains]=${P}`, { headers: auth() })
    await signOut('gallery')
  })

  const card = (page: import('@playwright/test').Page) =>
    page.locator('article', { hasText: `${P} summer show` })

  test('shows an event’s photos as thumbnails, folding the extras into a count', async ({
    page,
  }) => {
    // Wait for the page's scripts, or a press can land before the buttons are wired up.
    await page.goto('/events', { waitUntil: 'networkidle' })
    const thumbs = card(page).getByRole('list').getByRole('button')
    await expect(thumbs).toHaveCount(4)
    await expect(thumbs.first()).toHaveAccessibleName(`View photo 1 of 5: ${P} picture 1`)
    await expect(thumbs.last()).toHaveAccessibleName(`View all 5 photos of ${P} summer show`)
  })

  test('opens a photo in a lightbox that works from the keyboard', async ({ page }) => {
    // Wait for the page's scripts, or a press can land before the buttons are wired up.
    await page.goto('/events', { waitUntil: 'networkidle' })
    const first = card(page).getByRole('list').getByRole('button').first()
    await first.focus()
    await page.keyboard.press('Enter')

    const lightbox = page.getByRole('dialog', { name: `Photos: ${P} summer show` })
    await expect(lightbox).toBeVisible()
    await expect(lightbox.getByRole('img')).toHaveAttribute('alt', `${P} picture 1`)
    await expect(lightbox.getByRole('status')).toHaveText('Photo 1 of 5')

    // Arrow keys and the buttons both move through the photos, wrapping at the ends.
    await page.keyboard.press('ArrowRight')
    await expect(lightbox.getByRole('status')).toHaveText('Photo 2 of 5')
    await lightbox.getByRole('button', { name: 'Next' }).click()
    await expect(lightbox.getByRole('img')).toHaveAttribute('alt', `${P} picture 3`)
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(lightbox.getByRole('status')).toHaveText('Photo 5 of 5')

    // While it is open, Tab never reaches the page behind it. Focus may pass through the
    // browser's own controls on the way round (how that looks differs between systems), so
    // the check is that it is never on an element outside the lightbox.
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      const escaped = await lightbox.evaluate((el) => {
        const focused = document.activeElement
        return Boolean(focused && focused !== document.body && !el.contains(focused))
      })
      expect(escaped, `focus left the lightbox after ${i + 1} tabs`).toBe(false)
    }
    await lightbox.getByRole('button', { name: 'Close' }).focus()

    // Check accessibility on a settled lightbox: the photo loaded, the pointer off the
    // buttons, and any hover colour change finished. Otherwise a button can be caught
    // half-way between its two colours.
    await expect(lightbox.getByRole('img')).toHaveJSProperty('complete', true)
    await page.mouse.move(0, 0)
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation instanceof CSSTransition)
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
    )

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 90)).join(' | ')}`,
      ),
    ).toEqual([])

    // Escape closes it and puts focus back on the thumbnail that opened it.
    await page.keyboard.press('Escape')
    await expect(lightbox).toBeHidden()
    await expect(first).toBeFocused()
  })

  test('opens the flyer at full size, with no previous or next when there is one picture', async ({
    page,
  }) => {
    // Wait for the page's scripts, or a press can land before the buttons are wired up.
    await page.goto('/events', { waitUntil: 'networkidle' })
    await card(page)
      .getByRole('button', { name: `View larger: ${P} picture 1` })
      .click()
    const lightbox = page.getByRole('dialog')
    await expect(lightbox.getByRole('img')).toHaveAttribute('alt', `${P} picture 1`)
    await expect(lightbox.getByRole('button', { name: 'Next' })).toHaveCount(0)
    await lightbox.getByRole('button', { name: 'Close' }).click()
    await expect(lightbox).toBeHidden()
  })
})
