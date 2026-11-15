import { getPayload } from 'payload'

import config from '@payload-config'
import { purgeOldEnquiries } from '@/lib/enquiryStore'

/**
 * GET /api/cron/purge-enquiries: deletes enquiries past the retention period.
 * Vercel Cron calls it daily (vercel.json) with `Authorization: Bearer $CRON_SECRET`.
 * Without the secret set, nobody can call it.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 })
  }
  const deleted = await purgeOldEnquiries(await getPayload({ config }))
  return Response.json({ ok: true, deleted }, { headers: { 'Cache-Control': 'no-store' } })
}
