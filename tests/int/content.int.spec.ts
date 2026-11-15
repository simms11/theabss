/**
 * The content rules that protect children and parents, checked against a real database
 * through the same API the admin and the public use. Runs against the test database;
 * everything created is prefixed and removed afterwards.
 */
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { consentMessage, requireConsentForChildren } from '@/collections/Media'
import { endsAfterStart } from '@/collections/Events'
import type { User } from '@/payload-types'

const P = `itest-${Date.now()}`
const context = { disableRevalidate: true }

let payload: Payload
let admin: User
let editor: User
let file: { data: Buffer; mimetype: string; name: string; size: number }

const upload = (data: Record<string, unknown>) =>
  payload.create({
    collection: 'media',
    data: { alt: `${P} photo`, ...data } as never,
    file: { ...file, name: `${P}-${Math.random().toString(36).slice(2)}.png` },
    context,
  })

beforeAll(async () => {
  payload = await getPayload({ config })
  const png = await sharp({
    create: { width: 8, height: 8, channels: 3, background: '#a32a2a' },
  })
    .png()
    .toBuffer()
  file = { data: png, mimetype: 'image/png', name: `${P}.png`, size: png.length }
  admin = await payload.create({
    collection: 'users',
    data: { email: `${P}-admin@example.com`, password: 'test-password', name: 'A', role: 'admin' },
  })
  editor = await payload.create({
    collection: 'users',
    data: {
      email: `${P}-editor@example.com`,
      password: 'test-password',
      name: 'E',
      role: 'editor',
    },
  })
})

afterAll(async () => {
  await payload.delete({ collection: 'enquiries', where: { name: { contains: P } } })
  await payload.delete({ collection: 'events', where: { title: { contains: P } }, context })
  await payload.delete({ collection: 'media', where: { alt: { contains: P } } })
  await payload.delete({ collection: 'users', where: { email: { contains: P } } })
})

describe('photos of children', () => {
  it('rule: consent is only demanded when children are shown', () => {
    expect(requireConsentForChildren(false, 'yes')).toBe(consentMessage)
    expect(requireConsentForChildren(true, 'yes')).toBe(true)
    expect(requireConsentForChildren(false, 'no')).toBe(true)
  })

  it('refuses a photo of children without consent on record', async () => {
    await expect(upload({ showsChildren: 'yes', consentOnRecord: false })).rejects.toThrow(
      /consent/i,
    )
  })

  it('refuses an upload that does not answer the question at all', async () => {
    await expect(upload({})).rejects.toThrow()
  })

  it('accepts a photo of children once consent is confirmed, and a flyer without', async () => {
    const photo = await upload({ showsChildren: 'yes', consentOnRecord: true })
    const flyer = await upload({ showsChildren: 'no' })
    expect(photo.id).toBeTruthy()
    expect(flyer.id).toBeTruthy()
  })

  it('refuses an image with no description', async () => {
    await expect(upload({ alt: '', showsChildren: 'no' })).rejects.toThrow()
  })
})

describe('events', () => {
  const details = {
    title: `${P} sports day`,
    start: '2030-07-13T09:30:00.000Z',
    venue: 'Example Arena',
    summary: 'A family sports day.',
    type: 'sports' as const,
  }

  it('rule: an event cannot end before it starts', () => {
    expect(endsAfterStart('2030-07-13T16:00:00Z', '2030-07-13T09:30:00Z')).toBe(true)
    expect(endsAfterStart('2030-07-13T08:00:00Z', '2030-07-13T09:30:00Z')).not.toBe(true)
    expect(endsAfterStart(null, '2030-07-13T09:30:00Z')).toBe(true)
  })

  // A flyer image must never be the only place an event's details live.
  it('cannot be published without its date, venue and summary as text', async () => {
    for (const missing of ['start', 'venue', 'summary'] as const) {
      const { [missing]: _omitted, ...rest } = details
      await expect(
        payload.create({
          collection: 'events',
          data: { ...rest, title: `${P} no ${missing}`, _status: 'published' } as never,
          context,
        }),
        missing,
      ).rejects.toThrow()
    }
  })

  it('can be saved as a draft while details are still missing', async () => {
    const draft = await payload.create({
      collection: 'events',
      data: { title: `${P} draft`, _status: 'draft' } as never,
      draft: true,
      context,
    })
    expect(draft._status).toBe('draft')
  })

  it('shows the public only published events', async () => {
    await payload.create({
      collection: 'events',
      data: { ...details, _status: 'published' } as never,
      context,
    })
    const seen = await payload.find({
      collection: 'events',
      where: { title: { contains: P } },
      overrideAccess: false,
    })
    expect(seen.docs.map((e) => e.title)).toEqual([details.title])
  })
})

describe('enquiries from parents', () => {
  const enquiry = {
    name: `${P} parent`,
    email: 'parent@example.com',
    message: 'Do you have a place for a seven year old?',
    type: 'enrolment' as const,
  }

  it('cannot be created or read through the public API', async () => {
    await expect(
      payload.create({ collection: 'enquiries', data: enquiry as never, overrideAccess: false }),
    ).rejects.toThrow()
    // What the form's server action does: write with the Local API.
    await payload.create({ collection: 'enquiries', data: enquiry as never })
    await expect(payload.find({ collection: 'enquiries', overrideAccess: false })).rejects.toThrow()
  })

  it('can be read by admins but not by editors', async () => {
    const asAdmin = await payload.find({
      collection: 'enquiries',
      where: { name: { contains: P } },
      overrideAccess: false,
      user: admin,
    })
    expect(asAdmin.totalDocs).toBe(1)
    await expect(
      payload.find({ collection: 'enquiries', overrideAccess: false, user: editor }),
    ).rejects.toThrow()
  })
})

describe('roles', () => {
  it('lets an editor add events but not users or settings', async () => {
    const event = await payload.create({
      collection: 'events',
      data: { title: `${P} editor draft`, _status: 'draft' } as never,
      draft: true,
      overrideAccess: false,
      user: editor,
      context,
    })
    expect(event.id).toBeTruthy()
    await expect(
      payload.create({
        collection: 'users',
        data: { email: `${P}-x@example.com`, password: 'test-password', name: 'X', role: 'admin' },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
    await expect(
      payload.updateGlobal({
        slug: 'site-settings',
        data: { siteName: 'Changed' },
        overrideAccess: false,
        user: editor,
        context,
      }),
    ).rejects.toThrow()
  })
})
