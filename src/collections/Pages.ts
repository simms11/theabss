import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { admins, authenticated, authenticatedOrPublished } from '@/access'
import { pageEditor } from '@/fields/pageEditor'
import { slugField } from '@/fields/slug'
import { revalidatePage } from '@/hooks/revalidate'

/** Addresses the site uses itself; a page can't take one of them. */
export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'events',
  'contact',
  'payment',
  'forms',
  'documents',
  'styleguide',
  'sitemap',
  'robots',
  'media',
])

/**
 * Standalone pages: About, School Life, Educational Services, Finances, Payment, policies.
 * Editors write them in the rich-text editor; the layout stays in code, so the design can't
 * be broken. Drafts let a change be prepared and checked before it goes live.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: authenticatedOrPublished,
    readVersions: authenticated,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },
  versions: { drafts: true, maxPerDoc: 30 },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title', 'The web address, e.g. /about.'),
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 300,
      admin: { description: 'Optional short summary shown under the title.' },
    },
    { name: 'content', type: 'richText', required: true, editor: pageEditor },
    {
      name: 'navigation',
      type: 'select',
      defaultValue: 'none',
      required: true,
      options: [
        { label: 'Not linked', value: 'none' },
        { label: 'Main menu', value: 'header' },
        { label: 'Footer', value: 'footer' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Where the site links to this page once it is published.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers come first in the menu.' },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (data?.slug && RESERVED_SLUGS.has(data.slug)) {
          throw new ValidationError({
            collection: 'pages',
            errors: [
              {
                path: 'slug',
                message: `"/${data.slug}" is used by the site itself. Choose another address.`,
              },
            ],
            req,
          })
        }
        return data
      },
    ],
    afterChange: [revalidatePage],
    afterDelete: [revalidatePage],
  },
}
