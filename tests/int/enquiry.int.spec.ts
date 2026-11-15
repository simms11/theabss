import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { enquiryEmail, looksAutomated, validateEnquiry } from '@/lib/enquiry'
import { purgeOldEnquiries, retentionCutoff, saveEnquiry } from '@/lib/enquiryStore'
import { verifyTurnstile } from '@/lib/turnstile'

const P = `itest-enq-${Date.now()}`
const valid = {
  type: 'enrolment',
  name: `${P} parent`,
  email: 'Parent@Example.com',
  ageBand: '5-7',
  message: 'Do you have a place for a seven year old?',
}

describe('contact form rules', () => {
  it('accepts a complete message and tidies it', () => {
    const result = validateEnquiry({ ...valid, name: `  ${valid.name}  `, phone: '' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe(valid.name)
      expect(result.data.email).toBe('parent@example.com')
      expect(result.data).not.toHaveProperty('phone')
    }
  })

  it('says what to do about each missing or malformed answer', () => {
    const result = validateEnquiry({ email: 'not-an-email', phone: 'abc', message: 'Hi' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toEqual({
        type: 'Select what your message is about',
        name: 'Enter your name',
        email: 'Enter an email address in the correct format, like name@example.com',
        phone: 'Enter a phone number, like 07700 900 982, or leave it blank',
        message: 'Tell us a little more, so we can help',
      })
    }
  })

  it('ignores fields it did not ask for, such as a child’s name', () => {
    const result = validateEnquiry({ ...valid, childName: 'Ama', dateOfBirth: '2019-01-01' })
    expect(result.ok && Object.keys(result.data).sort()).toEqual(
      ['ageBand', 'email', 'message', 'name', 'type'].sort(),
    )
  })

  it('cuts an over-long message rather than storing it', () => {
    const result = validateEnquiry({ ...valid, message: 'x'.repeat(5000) })
    expect(result.ok && result.data.message.length).toBe(2000)
  })

  it('spots software that fills in the hidden field', () => {
    expect(looksAutomated({ ...valid, website: 'https://spam.example' })).toBe(true)
    expect(looksAutomated({ ...valid, website: '' })).toBe(false)
    expect(looksAutomated(valid)).toBe(false)
  })

  it('writes a notification the school can reply to directly', () => {
    const result = validateEnquiry(valid)
    if (!result.ok) throw new Error('expected valid')
    const email = enquiryEmail(result.data, 'ABSS')
    expect(email.replyTo).toBe('parent@example.com')
    expect(email.subject).toBe('New enrolment enquiry from the website')
    expect(email.text).toContain("Child's age band: 5 to 7")
    expect(email.text).toContain(valid.message)
  })
})

describe('human check', () => {
  const keys = { NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'site', TURNSTILE_SECRET_KEY: 'secret' }
  const answering = (success: boolean) =>
    (async () => new Response(JSON.stringify({ success }))) as unknown as typeof fetch

  it('is skipped when it is not configured', async () => {
    expect(await verifyTurnstile(undefined, {})).toBe(true)
  })

  it('needs a token Cloudflare accepts once configured', async () => {
    expect(await verifyTurnstile('', keys, answering(true))).toBe(false)
    expect(await verifyTurnstile('token', keys, answering(false))).toBe(false)
    expect(await verifyTurnstile('token', keys, answering(true))).toBe(true)
  })

  it('refuses when Cloudflare cannot be reached', async () => {
    const failing = (async () => {
      throw new Error('network')
    }) as unknown as typeof fetch
    expect(await verifyTurnstile('token', keys, failing)).toBe(false)
  })
})

describe('storing and deleting enquiries', () => {
  let payload: Payload
  const mine = { name: { contains: P } }

  beforeAll(async () => {
    payload = await getPayload({ config })
  })
  afterAll(async () => {
    await payload.delete({ collection: 'enquiries', where: mine })
  })

  it('saves the message as new, even though no notification address is set', async () => {
    const result = validateEnquiry(valid)
    if (!result.ok) throw new Error('expected valid')
    await saveEnquiry(payload, result.data)
    const { docs } = await payload.find({ collection: 'enquiries', where: mine })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ status: 'new', type: 'enrolment', ageBand: '5-7' })
  })

  it('keeps an enquiry for twelve months', () => {
    expect(retentionCutoff(new Date('2027-03-15T00:00:00Z')).toISOString()).toBe(
      '2026-03-15T00:00:00.000Z',
    )
  })

  it('leaves recent enquiries alone and deletes them once they are too old', async () => {
    expect(await purgeOldEnquiries(payload)).toBe(0)
    expect((await payload.count({ collection: 'enquiries', where: mine })).totalDocs).toBe(1)

    const thirteenMonthsOn = new Date()
    thirteenMonthsOn.setUTCMonth(thirteenMonthsOn.getUTCMonth() + 13)
    expect(await purgeOldEnquiries(payload, thirteenMonthsOn)).toBeGreaterThanOrEqual(1)
    expect((await payload.count({ collection: 'enquiries', where: mine })).totalDocs).toBe(0)
  })
})
