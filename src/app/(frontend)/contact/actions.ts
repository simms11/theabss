'use server'

import { getPayload } from 'payload'

import config from '@payload-config'
import { type EnquiryErrors, looksAutomated, validateEnquiry } from '@/lib/enquiry'
import { saveEnquiry } from '@/lib/enquiryStore'
import { TURNSTILE_FIELD, verifyTurnstile } from '@/lib/turnstile'

export type EnquiryFormState =
  | { status: 'idle' }
  | { status: 'sent' }
  | {
      status: 'error'
      errors: EnquiryErrors
      /** A problem that isn't about one field (the human check, or a fault on our side). */
      formError?: string
      /** What was typed, so nothing has to be entered twice. */
      values: Record<string, string>
    }

/**
 * Handles the contact form. Runs on the server, so it works with JavaScript off and the
 * rules can't be skipped by editing the page.
 */
export async function submitEnquiry(
  _previous: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const raw = Object.fromEntries(formData.entries())
  const values = Object.fromEntries(
    Object.entries(raw).filter(([, value]) => typeof value === 'string'),
  ) as Record<string, string>

  // Say "sent" and save nothing: telling a bot it was caught only teaches it.
  if (looksAutomated(raw)) return { status: 'sent' }

  const result = validateEnquiry(raw)
  if (!result.ok) return { status: 'error', errors: result.errors, values }

  if (!(await verifyTurnstile(raw[TURNSTILE_FIELD]))) {
    return {
      status: 'error',
      errors: {},
      formError: 'We couldn’t confirm you’re not a robot. Please try again.',
      values,
    }
  }

  try {
    await saveEnquiry(await getPayload({ config }), result.data)
  } catch {
    return {
      status: 'error',
      errors: {},
      formError: 'Sorry, your message could not be sent. Please try again, or email us instead.',
      values,
    }
  }
  return { status: 'sent' }
}
