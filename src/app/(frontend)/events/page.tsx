import type { Metadata } from 'next'
import { Suspense } from 'react'

import { CallToAction } from '@/components/CallToAction'
import { EventLists } from '@/components/EventLists'
import { EventsBrowser } from '@/components/EventsBrowser'
import { eventFinishesAt } from '@/lib/dates'
import { getPastEvents, getSiteSettings, getUpcomingEvents } from '@/lib/queries'
import { absoluteUrl, asMedia, mediaSrc, serializeJsonLd } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Open days, performances, sports days and trips at the Afruika Bantu Saturday School.',
}

export default async function EventsPage() {
  const [upcoming, past, settings] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
    getSiteSettings(),
  ])

  // Event structured data, so search engines can show dates and venues in their results.
  const jsonLd = upcoming.map((event) => {
    const flyer = asMedia(event.flyer)
    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      description: event.summary,
      startDate: event.start,
      endDate: eventFinishesAt(event.start, event.end).toISOString(),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: event.venue,
        address: event.address ?? undefined,
      },
      image: flyer ? absoluteUrl(mediaSrc(flyer, 'feature')) : undefined,
      organizer: { '@type': 'Organization', name: settings.siteName, url: absoluteUrl('/') },
      url: absoluteUrl('/events'),
    }
  })

  return (
    <>
      {jsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      )}

      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">Events</h1>
          <p className="text-fg-muted mt-3 max-w-2xl text-lg">
            Open days, performances, sports days and trips. Families and the wider community are
            welcome.
          </p>
          {upcoming.length > 0 && (
            <p className="mt-5">
              <a
                href="/events/calendar.ics"
                className="text-accent inline-flex min-h-11 items-center font-bold"
              >
                Add all upcoming events to your calendar
              </a>
            </p>
          )}
        </div>
      </section>

      {/* The filter reads the address, which only the browser knows. Until it has loaded,
          and for visitors without JavaScript, every event is listed. */}
      <Suspense fallback={<EventLists upcoming={upcoming} past={past} />}>
        <EventsBrowser upcoming={upcoming} past={past} />
      </Suspense>
      <CallToAction />
    </>
  )
}
