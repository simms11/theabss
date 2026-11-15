import { describe, expect, it } from 'vitest'

import { isEventType } from '../../src/lib/eventTypes'
import { icsEscape, toCalendar } from '../../src/lib/ics'
import { LEGACY_PAGES } from '../../src/lib/legacyRedirects'

const event = {
  slug: 'sports-day',
  title: 'Sports, games; and more',
  start: '2030-07-13T09:30:00.000Z',
  end: '2030-07-13T16:00:00.000Z',
  venue: 'Example Arena',
  address: '1 Example Road\nLondon SW2',
  summary: 'A family sports day.\nBring trainers.',
  price: '£5 adults, £1 children',
  bookingUrl: 'https://example.com/book',
  updatedAt: '2030-01-02T03:04:05.000Z',
}

describe('calendar files', () => {
  const calendar = toCalendar([event], 'https://www.example.org', 'ABSS events')
  const lines = calendar.replace(/\r\n /g, '').split('\r\n')

  it('is a calendar with one entry, in the line format calendar apps expect', () => {
    expect(lines[0]).toBe('BEGIN:VCALENDAR')
    expect(lines.filter((line) => line === 'BEGIN:VEVENT')).toHaveLength(1)
    expect(calendar.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(calendar.split('\r\n').every((line) => line.length <= 75)).toBe(true)
  })

  it('gives the times in UTC, for the app to convert', () => {
    expect(lines).toContain('DTSTART:20300713T093000Z')
    expect(lines).toContain('DTEND:20300713T160000Z')
  })

  it('carries the title, place and details, escaped', () => {
    expect(lines).toContain('SUMMARY:Sports\\, games\; and more')
    expect(lines).toContain('LOCATION:Example Arena\\, 1 Example Road\\, London SW2')
    expect(lines.find((line) => line.startsWith('DESCRIPTION:'))).toBe(
      'DESCRIPTION:A family sports day.\\nBring trainers.\\n\\n£5 adults\\, £1 children\\n\\nBook: https://example.com/book',
    )
  })

  it('keeps the same identity when the event is edited, so apps update it in place', () => {
    expect(lines).toContain('UID:sports-day@www.example.org')
  })

  it('ends an event with no end time at midnight in London', () => {
    const open = toCalendar([{ ...event, end: null }], 'https://www.example.org', 'x')
    expect(open).toContain('DTEND:20300713T230000Z')
  })

  it('escapes backslashes before anything else', () => {
    expect(icsEscape('a\\b,c')).toBe('a\\\\b\\,c')
  })
})

describe('legacy addresses for trips, sports and arts', () => {
  it('land on the events page, filtered to a type that exists', () => {
    for (const path of ['/abss-trips.html', '/sports.html', '/arts-and-events.html']) {
      const destination = new URL(LEGACY_PAGES[path], 'https://www.example.org')
      expect(destination.pathname).toBe('/events')
      expect(isEventType(destination.searchParams.get('type')), path).toBe(true)
    }
  })
})
