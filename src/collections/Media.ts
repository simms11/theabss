import type { CheckboxFieldValidation, CollectionConfig } from 'payload'

import { admins, anyone, authenticated } from '@/access'

/**
 * Safeguarding rule: a photo that shows children can't be saved until someone
 * confirms the school holds parental consent for every child in it. Exported for tests.
 */
export const consentMessage =
  'This photo shows children. Tick the box to confirm the school holds parental consent for every child in it, or do not upload it.'

export const requireConsentForChildren = (
  consentOnRecord: boolean | null | undefined,
  showsChildren: string | null | undefined,
): true | string => (showsChildren === 'yes' && !consentOnRecord ? consentMessage : true)

const validateConsent: CheckboxFieldValidation = (value, { siblingData }) =>
  requireConsentForChildren(value, (siblingData as { showsChildren?: string })?.showsChildren)

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description: 'Photos and flyers. Every image needs a description and a consent answer.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },
  upload: {
    // Local disk in dev; a private S3 bucket behind CloudFront in production.
    staticDir: 'media',
    mimeTypes: ['image/*'],
    focalPoint: true,
    crop: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'feature', width: 1200, height: 800, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for people who can’t see it, e.g. “Pupils in kente sashes at the summer show”. Required.',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'showsChildren',
      type: 'radio',
      required: true,
      label: 'Does this image show children?',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ],
      admin: {
        description: 'Answer for every upload. Flyers and logos are usually “No”.',
      },
    },
    {
      name: 'consentOnRecord',
      type: 'checkbox',
      defaultValue: false,
      label: 'The school holds parental consent for every child shown',
      validate: validateConsent,
      admin: {
        condition: (_, siblingData) => siblingData?.showsChildren === 'yes',
      },
    },
  ],
}
