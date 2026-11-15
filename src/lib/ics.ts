import { eventFinishesAt } from '@/lib/dates'
import type { Event } from '@/payload-types'

/**
 * Calendar files (iCalendar, RFC 5545), so a parent can put an event in their phone's
 * calendar or subscribe to all of the school's events. Times are written in UTC, which
 * every calendar app converts to the viewer's own time zone.
 */
type CalendarEvent = Pick<
  Event,
  'slug' | 'title' | 'start' | 'end' | 'venue' | 'address' | 'summary' | 'price' | 'bookingUrl'
> & { updatedAt?: string | null }

/** Text values: backslash, comma, semicolon and newline are escaped. */
export const icsEscape = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;')

/** 20250712T093000Z */
const stamp = (date: Date): string => date.toISOString().replace(/[-:]|\.\d{3}/g, '')

/** Lines longer than 75 characters are continued on the next line, starting with a space. */
const fold = (line: string): string => line.match(/.{1,74}/gu)?.join('\r\n ') ?? line

const vevent = (event: CalendarEvent, siteUrl: string): string[] => {
  const host = new URL(siteUrl).hostname
  const where = [event.venue, ...(event.address ?? '').split(/\r?\n/)]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')
  const details = [event.summary, event.price, event.bookingUrl && `Book: ${event.bookingUrl}`]
    .filter(Boolean)
    .join('\n\n')
  return [
    'BEGIN:VEVENT',
    `UID:${event.slug}@${host}`,
    `DTSTAMP:${stamp(new Date(event.updatedAt || event.start))}`,
    `DTSTART:${stamp(new Date(event.start))}`,
    `DTEND:${stamp(eventFinishesAt(event.start, event.end))}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `LOCATION:${icsEscape(where)}`,
    `DESCRIPTION:${icsEscape(details)}`,
    `URL:${new URL('/events', siteUrl).toString()}`,
    'END:VEVENT',
  ]
}

export const toCalendar = (events: CalendarEvent[], siteUrl: string, name: string): string =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ABSS Online//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(name)}`,
    ...events.flatMap((event) => vevent(event, siteUrl)),
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n')
    .concat('\r\n')

export const calendarResponse = (body: string, filename: string): Response =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename.replace(/[^a-z0-9.-]/gi, '-')}"`,
      'Cache-Control': 'public, max-age=900',
    },
  })
