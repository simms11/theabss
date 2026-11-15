import type { CollectionConfig } from 'payload'

import { admins, anyone, authenticated } from '@/access'
import { revalidateDocument } from '@/hooks/revalidate'

export const DOCUMENT_CATEGORIES = [
  { value: 'application', label: 'Join the school' },
  { value: 'parents', label: 'For parents and carers' },
  { value: 'policies', label: 'Policies' },
] as const

/**
 * Forms and documents for parents to download: the application form, the home-school
 * agreement, school rules, policies. Shown on the Forms page, grouped by category.
 *
 * PDF and Word files only. Each file is uploaded on its own (not as a zip), so a parent can
 * open it on a phone and a screen reader can announce what it is. Stored on local disk in
 * development and in the storage bucket in production, like images.
 */
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Form or document', plural: 'Forms and documents' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'order', 'updatedAt'],
    group: 'Content',
    description: 'PDF or Word files for parents to download, shown on the Forms page.',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },
  upload: {
    staticDir: 'documents',
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'What the document is, e.g. “Student application form”.' },
    },
    {
      name: 'description',
      type: 'text',
      maxLength: 200,
      admin: { description: 'Optional. Who it is for or what to do with it.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'parents',
      options: DOCUMENT_CATEGORIES.map(({ value, label }) => ({ value, label })),
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers come first in their group.' },
    },
  ],
  hooks: {
    afterChange: [revalidateDocument],
    afterDelete: [revalidateDocument],
  },
}
