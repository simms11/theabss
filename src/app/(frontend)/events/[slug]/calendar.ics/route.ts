import { calendarResponse, toCalendar } from '@/lib/ics'
import { getEventBySlug } from '@/lib/queries'
import { SITE_URL } from '@/lib/utils'

/** GET /events/<slug>/calendar.ics: one event, to add to a calendar. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return new Response('Not found', { status: 404 })
  return calendarResponse(toCalendar([event], SITE_URL, event.title), `${event.slug}.ics`)
}
