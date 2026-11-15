import type { CollectionConfig } from 'payload'

import { admins, nobody } from '@/access'

/**
 * Messages from parents sent through the site's contact and enrolment forms.
 *
 * Privacy by design:
 *  - Minimum data: the parent's name, how to reply, and their message. No child's name or
 *    date of birth; only an age band, which is enough to say whether there is a place.
 *  - Nothing can be created or read through the public API. The form's server action writes
 *    with the Local API; only admins read, so editors never see parents' contact details.
 *  - Not versioned, so deleting an enquiry removes it completely.
 *  - Deleted automatically after the retention period (src/lib/enquiryStore.ts).
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'createdAt'],
    group: 'Admin',
    description: 'Messages from parents. Visible to admins only.',
  },
  access: {
    read: admins,
    create: nobody,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: 'Enrolment', value: 'enrolment' },
        { label: 'General', value: 'general' },
      ],
    },
    { name: 'name', type: 'text', required: true, label: 'Parent or carer’s name' },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'ageBand',
      type: 'select',
      label: 'Child’s age band',
      options: [
        { label: '5 to 7', value: '5-7' },
        { label: '8 to 11', value: '8-11' },
        { label: '12 to 16', value: '12-16' },
      ],
    },
    { name: 'message', type: 'textarea', required: true, maxLength: 2000 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Replied', value: 'replied' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
