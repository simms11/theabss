import type { CollectionConfig, DateFieldValidation } from 'payload'

import { admins, authenticated, authenticatedOrPublished } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateEvent } from '@/hooks/revalidate'

/** An event can't end before it starts. Exported for tests. */
export const endsAfterStart = (
  end: Date | string | null | undefined,
  start: Date | string | null | undefined,
): true | string =>
  !end || !start || new Date(end).getTime() >= new Date(start).getTime()
    ? true
    : 'The end must be after the start.'

const validateEnd: DateFieldValidation = (value, { siblingData }) =>
  endsAfterStart(value, (siblingData as { start?: string })?.start)

/**
 * School events: open days, trips, performances, sports days.
 *
 * A flyer image can't be read on a phone, searched or read aloud by a screen reader, so the
 * date, venue and summary are required text; the flyer is optional decoration. Payload skips required checks on drafts
 * and enforces them on publish, so an event can't go live without them.
 *
 * The site lists an event as upcoming until it has finished, then moves it to past events
 * on its own (src/lib/queries.ts), so nobody has to remember to take it down.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'start', 'venue', '_status'],
    group: 'Content',
    description: 'Type the date, venue and details as text. The flyer image is optional.',
  },
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: 'start',
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'community',
      options: [
        { label: 'Community', value: 'community' },
        { label: 'Performance', value: 'performance' },
        { label: 'Sports', value: 'sports' },
        { label: 'Trip', value: 'trip' },
        { label: 'Open day', value: 'open-day' },
        { label: 'Term date', value: 'term-date' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'start',
          type: 'date',
          required: true,
          index: true,
          admin: { date: { pickerAppearance: 'dayAndTime' }, width: '50%' },
        },
        {
          name: 'end',
          type: 'date',
          validate: validateEnd,
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            width: '50%',
            description: 'Optional. Without it the event counts as over at the end of its day.',
          },
        },
      ],
    },
    {
      name: 'venue',
      type: 'text',
      required: true,
      admin: { description: 'Name of the place, e.g. “Battersea Millennium Arena”.' },
    },
    {
      name: 'address',
      type: 'textarea',
      admin: { description: 'Street address and postcode, so parents can find it on a map.' },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      maxLength: 400,
      admin: {
        description: 'Who it is for and what happens. Shown on the event card. Max 400 characters.',
      },
    },
    {
      name: 'price',
      type: 'text',
      admin: { description: 'Optional, e.g. “Free” or “£5 adults, £1 children”.' },
    },
    {
      name: 'bookingUrl',
      type: 'text',
      label: 'Booking link',
      validate: (value: string | null | undefined) =>
        !value || /^https:\/\/[^\s]+$/i.test(value)
          ? true
          : 'Use the full address, starting with https://',
    },
    {
      name: 'flyer',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional. Everything on the flyer that matters must also be typed above.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateEvent],
    afterDelete: [revalidateEvent],
  },
}
