import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { DEFAULT_FEES } from '@/globals/SiteSettings'
import { formatPounds, formatSortCode, isStripePaymentLink, lowestWeeklyFee } from '@/lib/payments'

describe('card payment links', () => {
  it('accepts Stripe’s own payment pages', () => {
    expect(isStripePaymentLink('https://buy.stripe.com/test_abc123')).toBe(true)
    expect(isStripePaymentLink(' https://donate.stripe.com/abc123 ')).toBe(true)
  })

  // The button sends parents away to pay: it must only ever go to Stripe.
  it('refuses look-alikes, other sites, plain http and anything that is not a link', () => {
    for (const value of [
      'https://buy.stripe.com.evil.example/abc',
      'https://stripe.com.example/buy',
      'https://example.com/?next=https://buy.stripe.com/abc',
      'http://buy.stripe.com/abc',
      'https://buy.stripe.com/',
      'javascript:alert(1)',
      'buy.stripe.com/abc',
      '',
      null,
    ]) {
      expect(isStripePaymentLink(value), String(value)).toBe(false)
    }
  })

  it('shows a sort code in pairs', () => {
    expect(formatSortCode('401234')).toBe('40-12-34')
    expect(formatSortCode('40 12 34')).toBe('40-12-34')
    expect(formatSortCode('n/a')).toBe('n/a')
  })
})

describe('fees', () => {
  it('shows whole pounds without pence, and pence when there are some', () => {
    expect(formatPounds(13)).toBe('£13')
    expect(formatPounds(13.5)).toBe('£13.50')
  })

  it('finds the lowest weekly fee for the “from” price', () => {
    expect(lowestWeeklyFee(DEFAULT_FEES)).toBe(13)
    expect(lowestWeeklyFee([{ notWorking: 0, partTime: 9, fullTime: null }])).toBe(9)
  })

  it('shows no price at all when there is no fees table', () => {
    expect(lowestWeeklyFee([])).toBeNull()
    expect(lowestWeeklyFee(undefined)).toBeNull()
  })

  // A family with more children, or a parent in work, never pays less.
  it('ships with a fees table that rises with children and with work', () => {
    DEFAULT_FEES.forEach((row, index) => {
      expect(row.notWorking).toBeLessThanOrEqual(row.partTime)
      expect(row.partTime).toBeLessThanOrEqual(row.fullTime)
      if (index > 0) expect(row.notWorking).toBeGreaterThan(DEFAULT_FEES[index - 1].notWorking)
    })
  })
})

describe('payment settings', () => {
  let payload: Payload
  const context = { disableRevalidate: true }

  beforeAll(async () => {
    payload = await getPayload({ config })
  })
  afterAll(async () => {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { payments: { links: [] } },
      context,
    })
  })

  it('will not save a card payment that does not go to Stripe', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: { payments: { links: [{ label: 'Term fees', url: 'https://example.com/pay' }] } },
        context,
      }),
    ).rejects.toThrow()
  })

  it('saves a Stripe payment link', async () => {
    const saved = await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        payments: { links: [{ label: 'Term fees', url: 'https://buy.stripe.com/test_abc123' }] },
      },
      context,
    })
    expect(saved.payments?.links?.[0]?.label).toBe('Term fees')
  })
})
