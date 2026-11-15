import Image from 'next/image'
import Link from 'next/link'

import { EventCard } from '@/components/EventCard'
import { LocationMap } from '@/components/LocationMap'
import { getSiteSettings, getUpcomingEvents } from '@/lib/queries'
import { absoluteUrl, asMedia, mediaSrc, serializeJsonLd } from '@/lib/utils'

/**
 * Home page, in the order a new parent needs it: who we are, the key facts (when, who,
 * what, where, cost), what's coming up, where to find us, then the school's history.
 */
export default async function HomePage() {
  const [settings, events] = await Promise.all([getSiteSettings(), getUpcomingEvents(3)])
  const { school } = settings
  const hero = asMedia(settings.heroImage)

  const facts = [
    { label: 'When', value: school?.sessions },
    { label: 'Who', value: school?.ages },
    { label: 'What', value: school?.subjects },
    { label: 'Where', value: [school?.venue, school?.address].filter(Boolean).join(', ') },
    { label: 'Cost', value: school?.fees },
  ].filter((fact) => fact.value)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: settings.siteName,
    alternateName: settings.shortName,
    url: absoluteUrl('/'),
    description: settings.description ?? undefined,
    foundingDate: school?.founded ? String(school.founded) : undefined,
    email: settings.contactEmail ?? undefined,
    telephone: settings.phone ?? undefined,
    address: school?.address
      ? { '@type': 'PostalAddress', streetAddress: school.address, addressCountry: 'GB' }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <section className="dark-section relative isolate overflow-hidden">
        {hero && (
          <>
            <Image
              src={mediaSrc(hero, 'hero')}
              alt=""
              fill
              priority
              sizes="100vw"
              className="-z-20 object-cover"
            />
            {/* Darkens the photo so the heading keeps its contrast whatever is uploaded. */}
            <div className="bg-ink/75 absolute inset-0 -z-10" aria-hidden="true" />
          </>
        )}
        <div className="container-site py-20 sm:py-28">
          <p className="eyebrow text-accent">Saturday school in South London</p>
          <h1 className="text-display-xl mt-3 max-w-3xl">{settings.siteName}</h1>
          {settings.tagline && (
            <p className="text-fg-muted mt-5 max-w-2xl text-xl">{settings.tagline}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="btn-primary">
                Get in touch
              </a>
            )}
            <Link href="/events" className={settings.contactEmail ? 'btn-outline' : 'btn-primary'}>
              See what’s on
            </Link>
          </div>
        </div>
      </section>

      {facts.length > 0 && (
        <section aria-labelledby="facts-heading" className="border-line border-b">
          <div className="container-site py-10">
            <h2 id="facts-heading" className="sr-only">
              Key facts
            </h2>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="eyebrow text-accent">{fact.label}</dt>
                  <dd className="mt-1 text-lg font-bold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section aria-labelledby="events-heading" className="section">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="events-heading" className="text-display-lg">
              Coming up
            </h2>
            <Link
              href="/events"
              className="text-accent inline-flex min-h-11 items-center font-bold"
            >
              All events
            </Link>
          </div>
          {events.length > 0 ? (
            <ul className="mt-8 grid gap-5">
              {events.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-fg-muted mt-6">
              No events are booked in just now. New dates are added here as soon as they are set.
            </p>
          )}
        </div>
      </section>

      {school?.address && (
        <section aria-labelledby="find-us-heading" className="section border-line border-t">
          <div className="container-site">
            <h2 id="find-us-heading" className="text-display-lg">
              Find us
            </h2>
            <div className="mt-8">
              <LocationMap venue={school.venue} address={school.address} />
            </div>
          </div>
        </section>
      )}

      {school?.history && (
        <section aria-labelledby="history-heading" className="red-section section">
          <div className="container-site">
            <h2 id="history-heading" className="text-display-lg text-accent">
              Our history
            </h2>
            <div className="mt-5 max-w-2xl space-y-4 text-lg">
              {school.founded && (
                <p>
                  {settings.shortName} has taught children in South London every term since{' '}
                  {school.founded}.
                </p>
              )}
              <p>{school.history}</p>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
