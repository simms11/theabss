import type { Field, GlobalConfig, TextFieldSingleValidation } from 'payload'

import { admins, anyone } from '@/access'
import { revalidateSettings } from '@/hooks/revalidate'
import { isStripePaymentLink } from '@/lib/payments'
import { youtubeId } from '@/lib/youtube'

/** Social links must be full addresses: "@handle" would become a broken link in the footer. */
const httpsUrl: TextFieldSingleValidation = (value) =>
  !value || /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(value)
    ? true
    : 'Use the full address, starting with https:// (for example https://instagram.com/yourname).'

const socialLink = (name: string, label: string, placeholder: string): Field => ({
  name,
  type: 'text',
  label,
  validate: httpsUrl,
  admin: { placeholder },
})

/**
 * The four subjects the school has taught since 1997, worded from its own About and
 * Educational Services pages. Editors can reword, reorder or add to them.
 */
export const DEFAULT_SUBJECTS = [
  {
    name: 'African History',
    description:
      'Our most important subject. Pupils learn the history, origins and cultures of African people, and about leaders such as Marcus Garvey, Kwame Nkrumah, Assata Shakur, Queen Mother Moore and Walter Rodney.',
  },
  {
    name: 'English',
    description:
      'Reading comes first. We build a love of books early and grow confident readers, writers and speakers.',
  },
  {
    name: 'Maths',
    description:
      'Step-by-step teaching that builds confidence with numbers, with exam-paper support for older pupils in the run-up to their GCSEs.',
  },
  {
    name: 'Science',
    description:
      'Lessons that make learning fun and encourage pupils to explore, ask questions and share what they find.',
  },
]

/** Weekly fees in pounds, by number of children and the parent's work situation. */
export const DEFAULT_FEES = [
  { children: '1 child', notWorking: 13, partTime: 14, fullTime: 15 },
  { children: '2 children', notWorking: 19, partTime: 21, fullTime: 23 },
  { children: '3 children', notWorking: 24, partTime: 27, fullTime: 28 },
  { children: '4 children', notWorking: 26, partTime: 29, fullTime: 33 },
]

const poundsField = (name: string, label: string): Field => ({
  name,
  type: 'number',
  required: true,
  min: 0,
  label: `${label} (£ a week)`,
})

/** Videos from the school's YouTube channel. Editors can retitle, reorder, add or remove. */
export const DEFAULT_VIDEOS = [
  {
    title: 'Afruika Bantu Saturday School on NABSS TV',
    url: 'https://www.youtube.com/watch?v=oz1rbWQd9_k',
  },
  {
    title: 'Pan-Afrikan Sports and Cultural Day 2024',
    url: 'https://www.youtube.com/watch?v=IrTO8qOFu_4',
  },
  {
    title: 'Malcolm X: Afruika Bantu Saturday School',
    url: 'https://www.youtube.com/watch?v=o-hclskV4Is',
  },
]

/** A quotation and who said it. Leave the text empty to hide it. */
const quoteGroup = (
  name: string,
  label: string,
  defaults: { text: string; attribution: string },
): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    { name: 'text', type: 'textarea', maxLength: 300, defaultValue: defaults.text },
    { name: 'attribution', type: 'text', defaultValue: defaults.attribution },
  ],
})

/**
 * Site-wide facts a parent looks for first: who, when, where, how to get in touch. They live
 * here once and appear in the header, the home page's key-facts strip, the footer and the
 * structured data, so they can't drift apart.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'Admin' },
  access: {
    read: anyone,
    update: admins,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              defaultValue: 'Afruika Bantu Saturday School',
            },
            { name: 'shortName', type: 'text', required: true, defaultValue: 'ABSS' },
            {
              name: 'tagline',
              type: 'text',
              defaultValue: 'Excellence. Progression. Discipline. Respect. Knowledge of Self.',
            },
            {
              name: 'description',
              type: 'textarea',
              maxLength: 160,
              defaultValue:
                'Saturday lessons in English, Maths, Science and African History for children aged 5 to 16 in Tulse Hill, South London.',
              admin: { description: 'Shown in search results. Max 160 characters.' },
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Home page photo' },
            { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Default share image' },
          ],
        },
        {
          label: 'School',
          fields: [
            {
              name: 'school',
              type: 'group',
              fields: [
                {
                  name: 'sessions',
                  type: 'text',
                  label: 'When',
                  defaultValue: 'Saturday mornings in term time',
                },
                { name: 'ages', type: 'text', label: 'Who', defaultValue: 'Children aged 5 to 16' },
                {
                  name: 'subjects',
                  type: 'text',
                  label: 'What',
                  defaultValue: 'English, Maths, Science and African History',
                },
                {
                  name: 'venue',
                  type: 'text',
                  label: 'Where',
                  defaultValue: 'City Heights E-ACT Academy',
                },
                {
                  name: 'address',
                  type: 'textarea',
                  defaultValue: '33 Abbots Park\nLondon SW2 3PW',
                  admin: {
                    description:
                      'Street address and postcode. The map on the home page points here.',
                  },
                },
                { name: 'founded', type: 'number', defaultValue: 1997 },
                {
                  name: 'history',
                  type: 'textarea',
                  defaultValue:
                    'Our school is named in honour of Afruika Bantu (Annette Blair, 1955–1999): a freedom fighter, activist, scholar, African History researcher and teacher.',
                },
              ],
            },
          ],
        },
        {
          label: 'Teaching',
          description: 'The “What we teach” section of the home page.',
          fields: [
            {
              name: 'teaching',
              type: 'group',
              fields: [
                {
                  name: 'intro',
                  type: 'textarea',
                  maxLength: 400,
                  defaultValue:
                    'We teach children aged 5 to 16 every Saturday morning in term time. We believe in academic excellence for all, and we want every pupil to aim high.',
                },
                {
                  name: 'subjects',
                  type: 'array',
                  minRows: 1,
                  maxRows: 8,
                  labels: { singular: 'Subject', plural: 'Subjects' },
                  admin: { description: 'One card per subject, in this order.' },
                  defaultValue: DEFAULT_SUBJECTS,
                  fields: [
                    { name: 'name', type: 'text', required: true },
                    {
                      name: 'description',
                      type: 'textarea',
                      required: true,
                      maxLength: 240,
                      admin: { description: 'What pupils learn. Max 240 characters.' },
                    },
                  ],
                },
                {
                  name: 'tutoring',
                  type: 'textarea',
                  maxLength: 300,
                  label: 'Extra support',
                  defaultValue:
                    'One-to-one tutoring is available for pupils who need extra support in a subject.',
                },
              ],
            },
          ],
        },
        {
          label: 'Quotes',
          description:
            'Words the school teaches by. The featured quote has its own band on the home page; the closing quote ends the history section.',
          fields: [
            {
              name: 'quotes',
              type: 'group',
              fields: [
                quoteGroup('feature', 'Featured quote', {
                  text: 'A people without the knowledge of their past history, origin and culture is like a tree without roots.',
                  attribution: 'The Honourable Marcus Mosiah Garvey',
                }),
                quoteGroup('closing', 'Closing quote', {
                  text: 'Up, you mighty race, for you can accomplish what you will.',
                  attribution: 'The Honourable Marcus Mosiah Garvey',
                }),
              ],
            },
          ],
        },
        {
          label: 'Videos',
          description:
            'Videos from the school’s YouTube channel, shown on the home page. Each loads only when a visitor presses play.',
          fields: [
            {
              name: 'videos',
              type: 'array',
              maxRows: 6,
              labels: { singular: 'Video', plural: 'Videos' },
              defaultValue: DEFAULT_VIDEOS,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  admin: { description: 'Shown under the video and read out by screen readers.' },
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'YouTube address',
                  validate: (value: string | null | undefined) =>
                    youtubeId(value)
                      ? true
                      : 'Paste the video’s address from YouTube, e.g. https://www.youtube.com/watch?v=…',
                  admin: { placeholder: 'https://www.youtube.com/watch?v=...' },
                },
              ],
            },
          ],
        },
        {
          label: 'Payments',
          description:
            'The Payment page. Card payments go through Stripe; bank details are shown as text.',
          fields: [
            {
              name: 'payments',
              type: 'group',
              fields: [
                {
                  name: 'intro',
                  type: 'textarea',
                  maxLength: 400,
                  defaultValue:
                    'What it costs, and how to pay. Fees depend on how many children attend and on your work situation, so that the school stays affordable for every family.',
                },
                {
                  name: 'fees',
                  type: 'group',
                  admin: {
                    description:
                      'The fees table. The lowest weekly fee is also shown as “Cost” in the key facts on the home page.',
                  },
                  fields: [
                    {
                      name: 'rows',
                      type: 'array',
                      maxRows: 10,
                      labels: { singular: 'Row', plural: 'Weekly fees' },
                      defaultValue: DEFAULT_FEES,
                      fields: [
                        {
                          name: 'children',
                          type: 'text',
                          required: true,
                          admin: { description: 'e.g. “1 child”', width: '25%' },
                        },
                        {
                          type: 'row',
                          fields: [
                            poundsField('notWorking', 'Parent not working'),
                            poundsField('partTime', 'Parent working part time'),
                            poundsField('fullTime', 'Parent working full time'),
                          ],
                        },
                      ],
                    },
                    {
                      name: 'adminFee',
                      type: 'number',
                      min: 0,
                      defaultValue: 30,
                      label: 'One-off admin fee (£)',
                      admin: {
                        description: 'Paid once, when a family joins. Leave empty for none.',
                      },
                    },
                    {
                      name: 'schedule',
                      type: 'text',
                      label: 'When fees can be paid',
                      defaultValue: 'Weekly, monthly or termly',
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
                      maxLength: 600,
                      label: 'Terms',
                      defaultValue:
                        'If you no longer wish your child to attend, please give four weeks’ notice. Without notice, weekly fees continue to be owed while your child is absent.',
                    },
                  ],
                },
                {
                  name: 'links',
                  type: 'array',
                  maxRows: 12,
                  labels: { singular: 'Card payment', plural: 'Card payments' },
                  admin: {
                    description:
                      'One button per payment. Create a Payment Link in the Stripe dashboard and paste its address here.',
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      admin: { description: 'What it pays for, e.g. “Term fees” or “Donate”.' },
                    },
                    { name: 'description', type: 'text', maxLength: 160 },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      label: 'Stripe payment link',
                      validate: (value: string | null | undefined) =>
                        isStripePaymentLink(value)
                          ? true
                          : 'Paste a Stripe Payment Link. It starts with https://buy.stripe.com/ or https://donate.stripe.com/',
                      admin: { placeholder: 'https://buy.stripe.com/...' },
                    },
                  ],
                },
                {
                  name: 'bank',
                  type: 'group',
                  label: 'Bank transfer',
                  admin: { description: 'Shown as text on the Payment page. Leave empty to hide.' },
                  fields: [
                    { name: 'accountName', type: 'text' },
                    { name: 'bankName', type: 'text' },
                    { name: 'sortCode', type: 'text' },
                    { name: 'accountNumber', type: 'text' },
                    {
                      name: 'reference',
                      type: 'text',
                      label: 'Payment reference',
                      admin: {
                        description: 'What to put as the reference, e.g. “Your child’s initials”.',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Contact & Social',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              admin: { description: 'Shown on the site as a link parents can tap.' },
            },
            { name: 'phone', type: 'text' },
            {
              name: 'social',
              type: 'group',
              fields: [
                socialLink('instagram', 'Instagram', 'https://instagram.com/...'),
                socialLink('x', 'X (Twitter)', 'https://x.com/...'),
                socialLink('youtube', 'YouTube', 'https://youtube.com/@...'),
                socialLink('facebook', 'Facebook', 'https://facebook.com/...'),
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSettings],
  },
}
