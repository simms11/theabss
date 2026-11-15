import type { CollectionConfig } from 'payload'

import { admins, adminsField, adminsOrSelf, authenticated, isAdmin } from '@/access'
import type { User } from '@/payload-types'

/**
 * People who can sign in to the admin. Two roles:
 *  - admin  — runs the site: users, Site Settings, and enquiries from parents.
 *  - editor — a volunteer who keeps events, pages and photos up to date. Editors can't see
 *             enquiries, which hold parents' contact details.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Admin',
  },
  access: {
    // Signed-in only. Field-level read rules hide values but not filters, so a public
    // collection would let anyone confirm an email address one guess at a time.
    read: authenticated,
    create: admins,
    update: adminsOrSelf,
    delete: admins,
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      access: {
        // Only admins and the user themselves can read an email address.
        read: ({ req: { user }, doc }) => isAdmin(user as User) || user?.id === doc?.id,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        create: adminsField,
        update: adminsField,
      },
      admin: {
        position: 'sidebar',
        description:
          'Admins manage users, settings and enquiries. Editors update events, pages and photos.',
      },
    },
  ],
}
