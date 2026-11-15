import { calendarResponse, toCalendar } from '@/lib/ics'
import { getSiteSettings, getUpcomingEvents } from '@/lib/queries'
import { SITE_URL } from '@/lib/utils'

/**
 * GET /events/calendar.ics: every upcoming event. A calendar app that subscribes to this
 * address picks up new events by itself.
 */
export async function GET() {
  const [settings, events] = await Promise.all([getSiteSettings(), getUpcomingEvents()])
  return calendarResponse(
    toCalendar(events, SITE_URL, `${settings.shortName} events`),
    'abss-events.ics',
  )
}
