import type { Event } from '@/payload-types'

export type EventType = Event['type']

/** Singular, for the label on a card. */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  community: 'Community',
  performance: 'Performance',
  sports: 'Sports',
  trip: 'Trip',
  'open-day': 'Open day',
  'term-date': 'Term date',
}

/** Plural, for the filter buttons. */
export const EVENT_FILTER_LABELS: Record<EventType, string> = {
  community: 'Community',
  performance: 'Arts and performances',
  sports: 'Sports',
  trip: 'Trips',
  'open-day': 'Open days',
  'term-date': 'Term dates',
}

export const isEventType = (value: unknown): value is EventType =>
  typeof value === 'string' && value in EVENT_TYPE_LABELS
