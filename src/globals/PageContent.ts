import type { GlobalConfig } from 'payload'

import { admins, anyone } from '@/access'
import { revalidateSettings } from '@/hooks/revalidate'

/**
 * The wording of the site's fixed pages and shared bands. The layout stays in code, so the
 * design can't be broken, but the words belong to the school: an admin can change any of
 * them here without a developer. Headings that give a page its structure stay in code.
 */
export const PageContent: GlobalConfig = {
  slug: 'page-content',
  label: 'Page wording',
  admin: {
    group: 'Admin',
    description: 'The introductions and invitations on the home, events, contact and forms pages.',
  },
  access: {
    read: anyone,
    update: admins,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Home',
          fields: [
            {
              name: 'home',
              type: 'group',
              fields: [
                {
                  name: 'heroLabel',
                  type: 'text',
                  maxLength: 60,
                  label: 'Label above the school’s name',
                  defaultValue: 'Saturday school in South London',
                },
              ],
            },
          ],
        },
        {
          label: 'Closing invitation',
          description: 'The band that ends most pages, inviting a parent to get in touch.',
          fields: [
            {
              name: 'invitation',
              type: 'group',
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                  maxLength: 80,
                  defaultValue: 'Would you like a place for your child?',
                },
                {
                  name: 'text',
                  type: 'textarea',
                  maxLength: 240,
                  defaultValue:
                    'Tell us your child’s age and we’ll reply by email. You’re welcome to visit on a Saturday first.',
                },
              ],
            },
          ],
        },
        {
          label: 'Page introductions',
          description: 'The sentence under each page’s title.',
          fields: [
            {
              name: 'intros',
              type: 'group',
              fields: [
                {
                  name: 'events',
                  type: 'textarea',
                  maxLength: 240,
                  defaultValue:
                    'Open days, performances, sports days and trips. Families and the wider community are welcome.',
                },
                {
                  name: 'contact',
                  type: 'textarea',
                  maxLength: 240,
                  defaultValue:
                    'Ask about a place for your child, volunteering, or anything else. We’ll reply by email.',
                },
                {
                  name: 'forms',
                  type: 'textarea',
                  maxLength: 240,
                  defaultValue:
                    'The application form, school rules, policies and guides for parents and carers.',
                },
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
