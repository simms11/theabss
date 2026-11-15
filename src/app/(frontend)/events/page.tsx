import type { Metadata } from 'next'

import { EventCard } from '@/components/EventCard'
import { getPastEvents, getUpcomingEvents } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Open days, performances, sports days and trips at the Afruika Bantu Saturday School.',
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()])

  return (
    <>
      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">Events</h1>
          <p className="text-fg-muted mt-3 max-w-2xl text-lg">
            Open days, performances, sports days and trips. Families and the wider community are
            welcome.
          </p>
        </div>
      </section>

      <section aria-labelledby="upcoming-heading" className="section">
        <div className="container-site">
          <h2 id="upcoming-heading" className="text-display-md">
            Coming up
          </h2>
          {upcoming.length > 0 ? (
            <ul className="mt-6 grid gap-5">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-fg-muted mt-4">
              No events are booked in just now. New dates are added here as soon as they are set.
            </p>
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
