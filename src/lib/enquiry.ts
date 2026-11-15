/**
 * The rules for a message sent through the contact form. Pure functions, shared by the form's
 * server action and the tests. Nothing here touches the database.
 *
 * Privacy: we ask for the least that lets the school reply. No child's name or
 * date of birth; an optional age band is enough to say whether there is a place.
 */
export const ENQUIRY_TYPES = ['enrolment', 'general'] as const
export const AGE_BANDS = ['5-7', '8-11', '12-16'] as const

/** Enquiries older than this are deleted automatically (src/lib/enquiryStore.ts). */
export const ENQUIRY_RETENTION_MONTHS = 12

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]
export type AgeBand = (typeof AGE_BANDS)[number]

export type EnquiryInput = {
  type: EnquiryType
  name: string
  email: string
  phone?: string
  ageBand?: AgeBand
  message: string
}

export type EnquiryField = 'type' | 'name' | 'email' | 'phone' | 'ageBand' | 'message'
export type EnquiryErrors = Partial<Record<EnquiryField, string>>

/** In the order the fields appear, so the error summary reads top to bottom. */
export const FIELD_ORDER: EnquiryField[] = ['type', 'name', 'email', 'phone', 'ageBand', 'message']

const text = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

/** Deliberately loose: the only real test of an address is whether a reply arrives. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^[\d\s()+-]{7,20}$/

/**
 * Checks a submission. Messages follow the GOV.UK pattern: say what to do, not what went
 * wrong ("Enter your email address", not "Email is invalid").
 */
export const validateEnquiry = (
  raw: Record<string, unknown>,
): { ok: true; data: EnquiryInput } | { ok: false; errors: EnquiryErrors } => {
  const errors: EnquiryErrors = {}
  const type = text(raw.type, 20)
  const name = text(raw.name, 100)
  const email = text(raw.email, 200).toLowerCase()
  const phone = text(raw.phone, 30)
  const ageBand = text(raw.ageBand, 10)
  const message = text(raw.message, 2000)

  if (!ENQUIRY_TYPES.includes(type as EnquiryType))
    errors.type = 'Select what your message is about'
  if (!name) errors.name = 'Enter your name'
  if (!email) errors.email = 'Enter your email address'
  else if (!EMAIL.test(email)) {
    errors.email = 'Enter an email address in the correct format, like name@example.com'
  }
  if (phone && !PHONE.test(phone)) {
    errors.phone = 'Enter a phone number, like 07700 900 982, or leave it blank'
  }
  if (ageBand && !AGE_BANDS.includes(ageBand as AgeBand)) errors.ageBand = 'Select an age band'
  if (!message) errors.message = 'Enter your message'
  else if (message.length < 10) errors.message = 'Tell us a little more, so we can help'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    data: {
      type: type as EnquiryType,
      name,
      email,
      message,
      ...(phone ? { phone } : {}),
      ...(ageBand ? { ageBand: ageBand as AgeBand } : {}),
    },
  }
}

/**
 * The form has a field people can't see. Software that fills in every field gives itself
 * away by filling it in.
 */
export const HONEYPOT_FIELD = 'website'
export const looksAutomated = (raw: Record<string, unknown>): boolean =>
  typeof raw[HONEYPOT_FIELD] === 'string' && raw[HONEYPOT_FIELD].trim() !== ''

/** The notification sent to the school. Plain text; replying goes to the parent. */
export const enquiryEmail = (enquiry: EnquiryInput, siteName: string) => ({
  subject: `New ${enquiry.type === 'enrolment' ? 'enrolment' : 'general'} enquiry from the website`,
  replyTo: enquiry.email,
  text: [
    `${enquiry.name} sent a message through the ${siteName} website.`,
    '',
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    ...(enquiry.phone ? [`Phone: ${enquiry.phone}`] : []),
    ...(enquiry.ageBand ? [`Child's age band: ${enquiry.ageBand.replace('-', ' to ')}`] : []),
    '',
    enquiry.message,
    '',
    'Reply to this email to answer them. The message is also in the site admin under Enquiries.',
  ].join('\n'),
})
