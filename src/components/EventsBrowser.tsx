'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { EventLists } from '@/components/EventLists'
import { EVENT_FILTER_LABELS, type EventType, isEventType } from '@/lib/eventTypes'
import { cn } from '@/lib/utils'
import type { Event } from '@/payload-types'

/**
 * The events lists with a filter by type (trips, sports, performances…). The choice lives
 * in the address (?type=trip), so a filtered view can be linked to, shared and reached
 * with the back button.
 *
 * Each filter is a toggle button that says whether it is pressed, and the number of
 * matching events is announced when it changes. Only types that have events are offered.
 */
export function EventsBrowser({ upcoming, past }: { upcoming: Event[]; past: Event[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const requested = useSearchParams().get('type')
  const types = (Object.keys(EVENT_FILTER_LABELS) as EventType[]).filter((type) =>
    [...upcoming, ...past].some((event) => event.type === type),
  )
  const active = isEventType(requested) && types.includes(requested) ? requested : null
  const matches = (event: Event) => !active || event.type === active
  const shownUpcoming = upcoming.filter(matches)
  const shownPast = past.filter(matches)
  const count = shownUpcoming.length + shownPast.length

  const select = (type: EventType | null) =>
    router.replace(type ? `${pathname}?type=${type}` : pathname, { scroll: false })

  const button = (type: EventType | null, label: string) => (
    <button
      key={type ?? 'all'}
      type="button"
      aria-pressed={active === type}
      onClick={() => select(type)}
      className={cn(
        'border-ink inline-flex min-h-11 items-center rounded-full border-2 px-4 font-bold transition-colors',
        active === type ? 'bg-ink text-paper' : 'hover:bg-sand bg-transparent',
      )}
    >
      {label}
    </button>
  )

  return (
    <>
      {types.length > 1 && (
        <div className="border-line border-b">
          <div className="container-site py-6">
            <div role="group" aria-label="Filter events by type" className="flex flex-wrap gap-2">
              {button(null, 'All events')}
              {types.map((type) => button(type, EVENT_FILTER_LABELS[type]))}
            </div>
            <p role="status" className="text-fg-muted mt-3">
              Showing {count} {count === 1 ? 'event' : 'events'}
              {active ? ` in ${EVENT_FILTER_LABELS[active].toLowerCase()}` : ''}
            </p>
          </div>
        </div>
      )}
      <EventLists
        upcoming={shownUpcoming}
        past={shownPast}
        emptyMessage={
          active
            ? `Nothing coming up in ${EVENT_FILTER_LABELS[active].toLowerCase()} just now.`
            : undefined
        }
      />
    </>
  )
}
