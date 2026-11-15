import { EventCard } from '@/components/EventCard'
import type { Event } from '@/payload-types'

/** The upcoming and past lists, as plain HTML. Also what a visitor without JavaScript gets. */
export function EventLists({
  upcoming,
  past,
  emptyMessage = 'No events are booked in just now. New dates are added here as soon as they are set.',
}: {
  upcoming: Event[]
  past: Event[]
  emptyMessage?: string
}) {
  return (
    <>
      <section aria-labelledby="upcoming-heading" className="section">
        <div className="container-site">
          <h2 id="upcoming-heading" className="text-display-md">
            Coming up
          </h2>
          {upcoming.length > 0 ? (
            <ul className="mt-6 grid gap-5">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} calendarLink />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-fg-muted mt-4">{emptyMessage}</p>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section aria-labelledby="past-heading" className="section border-line border-t">
          <div className="container-site">
            <h2 id="past-heading" className="text-display-md">
              Past events
            </h2>
            <ul className="mt-6 grid gap-5">
              {past.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
