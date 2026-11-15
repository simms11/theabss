import { describe, expect, it } from 'vitest'

import { eventFinishesAt, formatEventWhen, isUpcoming } from '../../src/lib/dates'

describe('event dates', () => {
  // Stored in UTC, shown in London time. 12 July is British Summer Time (UTC+1).
  it('shows London time whatever the server clock is', () => {
    expect(formatEventWhen('2025-07-12T09:30:00.000Z', '2025-07-12T16:00:00.000Z')).toBe(
      'Saturday 12 July 2025, 10:30am to 5pm',
    )
  })

  it('shows winter dates without the summer offset', () => {
    expect(formatEventWhen('2026-12-05T14:00:00.000Z')).toBe('Saturday 5 December 2026, 2pm')
  })

  it('names both days when an event runs overnight', () => {
    expect(formatEventWhen('2026-08-01T08:00:00.000Z', '2026-08-02T16:00:00.000Z')).toBe(
      'Saturday 1 August 2026, 9am to Sunday 2 August 2026, 5pm',
    )
  })

  describe('upcoming or past', () => {
    const event = { start: '2025-07-12T09:30:00.000Z', end: '2025-07-12T16:00:00.000Z' }

    it('is upcoming before it starts and while it is happening', () => {
      expect(isUpcoming(event, new Date('2025-07-01T00:00:00Z'))).toBe(true)
      expect(isUpcoming(event, new Date('2025-07-12T12:00:00Z'))).toBe(true)
    })

    // A finished event must drop off the upcoming list without anyone editing it.
    it('is past as soon as it has finished', () => {
      expect(isUpcoming(event, new Date('2025-07-12T16:00:01Z'))).toBe(false)
      expect(isUpcoming(event, new Date('2026-11-15T00:00:00Z'))).toBe(false)
    })

    it('without an end time, lasts until midnight in London', () => {
      // Summer: London midnight is 23:00 UTC.
      expect(eventFinishesAt('2025-07-12T09:30:00.000Z').toISOString()).toBe(
        '2025-07-12T23:00:00.000Z',
      )
      // Winter: London midnight is 00:00 UTC.
      expect(eventFinishesAt('2026-12-05T14:00:00.000Z').toISOString()).toBe(
        '2026-12-06T00:00:00.000Z',
      )
    })
  })
})
