import type { Payload } from 'payload'

import { ENQUIRY_RETENTION_MONTHS, enquiryEmail, type EnquiryInput } from '@/lib/enquiry'

/**
 * Saves an enquiry, then tells the school. Saving comes first and is what counts: if the
 * email fails (provider down, address not set yet) the message is still in the admin, and
 * the parent is not asked to send it again.
 *
 * The collection refuses public API writes; this runs on the server with the Local API.
 */
export const saveEnquiry = async (payload: Payload, enquiry: EnquiryInput): Promise<void> => {
  await payload.create({ collection: 'enquiries', data: { ...enquiry, status: 'new' } as never })

  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const to = process.env.CONTACT_EMAIL || settings.contactEmail
    if (!to) {
      payload.logger.warn('Enquiry saved, but no CONTACT_EMAIL is set, so no email was sent.')
      return
    }
    await payload.sendEmail({ to, ...enquiryEmail(enquiry, settings.siteName) })
  } catch (err) {
    // Never log the enquiry itself: logs are kept longer and seen by more people.
    payload.logger.error(`Enquiry saved, but the notification failed: ${(err as Error).message}`)
  }
}

/** The moment before which enquiries are due for deletion. */
export const retentionCutoff = (now: Date = new Date()): Date => {
  const cutoff = new Date(now)
  cutoff.setUTCMonth(cutoff.getUTCMonth() - ENQUIRY_RETENTION_MONTHS)
  return cutoff
}

/**
 * Deletes enquiries older than the retention period, whatever their status. Run daily by
 * the cron job. The collection has no versions, so a deleted enquiry is gone completely.
 */
export const purgeOldEnquiries = async (
  payload: Payload,
  now: Date = new Date(),
): Promise<number> => {
  const { docs } = await payload.delete({
    collection: 'enquiries',
    where: { createdAt: { less_than: retentionCutoff(now).toISOString() } },
  })
  return docs.length
}
