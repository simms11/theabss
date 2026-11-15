import type { GlobalConfig } from 'payload'

import { admins, anyone } from '@/access'
import { revalidateSettings } from '@/hooks/revalidate'

/**
 * Starting answers to what parents ask first. They point to the Fees and Contact pages
 * instead of repeating prices or addresses, so they can't fall out of date with them.
 */
export const DEFAULT_FAQS = [
  {
    question: 'What ages do you teach?',
    answer: 'Children aged 5 to 16.',
  },
  {
    question: 'What subjects do you teach?',
    answer:
      'African History, English, Maths and Science. One-to-one tutoring is available for pupils who need extra support in a subject.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'Weekly fees depend on how many children attend and on your work situation, and there is a one-off admin fee when you join. The Fees and payment page has the full table.',
  },
  {
    question: 'How do I apply for a place?',
    answer:
      'Send us a message through the Contact page and tell us your child’s age. We’ll reply by email.',
  },
  {
    question: 'Do you help with GCSEs?',
    answer:
      'Yes. Our older students often bring in exam papers from their mainstream school, and our teachers support them on Saturday mornings in the run-up to their GCSEs.',
  },
  {
    question: 'What if my child stops attending?',
    answer:
      'Please give us four weeks’ notice. Without notice, weekly fees continue to be owed while your child is absent.',
  },
]

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
          label: 'Questions and answers',
          description:
            'The “Questions parents ask” section of the Contact page, shown above the form.',
          fields: [
            {
              name: 'faqs',
              type: 'array',
              maxRows: 20,
              labels: { singular: 'Question', plural: 'Questions' },
              defaultValue: DEFAULT_FAQS,
              fields: [
                { name: 'question', type: 'text', required: true, maxLength: 120 },
                { name: 'answer', type: 'textarea', required: true, maxLength: 600 },
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
