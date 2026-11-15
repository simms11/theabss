import Image from 'next/image'
import Link from 'next/link'

import { CallToAction } from '@/components/CallToAction'
import { EventCard } from '@/components/EventCard'
import { LocationMap } from '@/components/LocationMap'
import { Quote } from '@/components/Quote'
import { VideoEmbed } from '@/components/VideoEmbed'
import { getPublishedPages, getSiteSettings, getUpcomingEvents } from '@/lib/queries'
import { keyFacts } from '@/lib/keyFacts'
import { socialLinksFrom } from '@/lib/social'
import { youtubeId } from '@/lib/youtube'
import { absoluteUrl, asMedia, cn, mediaSrc, serializeJsonLd } from '@/lib/utils'

/** The school's colours as a stripe on each subject card: a shape, never text. */
const SUBJECT_ACCENTS = ['border-t-red', 'border-t-gold', 'border-t-green', 'border-t-ink']

/**
 * Home page, in the order a new parent needs it: who we are, the key facts (when, who,
 * what, where, cost), what we teach, a quote the
 * school teaches by, what's coming up, where to find us, then the school's history.
 */
export default async function HomePage() {
  const [settings, events, pages] = await Promise.all([
    getSiteSettings(),
    getUpcomingEvents(3),
    getPublishedPages(),
  ])
  const { school, teaching, quotes } = settings
  const subjects = teaching?.subjects ?? []
  const videos = (settings.videos ?? []).flatMap((video) => {
    const id = youtubeId(video.url)
    return id ? [{ id, title: video.title }] : []
  })
  const hero = asMedia(settings.heroImage)

  const facts = keyFacts(settings)
  const has = (slug: string) => pages.some((page) => page.slug === slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: settings.siteName,
    alternateName: settings.shortName,
    url: absoluteUrl('/'),
    description: settings.description ?? undefined,
    foundingDate: school?.founded ? String(school.founded) : undefined,
    email: settings.contactEmail ?? undefined,
    sameAs: socialLinksFrom(settings.social).map((link) => link.href),
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
          {/* What the school is, in a sentence, before its values. */}
          {settings.description && (
            <p className="mt-5 max-w-2xl text-xl sm:text-2xl">{settings.description}</p>
          )}
          {settings.tagline && (
            <p className="text-accent mt-4 max-w-2xl font-bold">{settings.tagline}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
            <Link href="/events" className="btn-outline">
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
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="eyebrow text-accent">{fact.label}</dt>
                  <dd className="mt-1 text-lg font-bold">
                    {fact.value}
                    {fact.href && (
                      <Link
                        href={fact.href}
                        className="text-accent block min-h-11 pt-1 text-base font-bold"
                      >
                        {fact.linkText}
                      </Link>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {subjects.length > 0 && (
        <section aria-labelledby="teaching-heading" className="section">
          <div className="container-site">
            <h2 id="teaching-heading" className="text-display-lg">
              What we teach
            </h2>
            {teaching?.intro && <p className="mt-4 max-w-2xl text-lg">{teaching.intro}</p>}
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {subjects.map((subject, index) => (
                <li
                  key={subject.id ?? subject.name}
                  className={cn(
                    'card border-t-4 p-5',
                    SUBJECT_ACCENTS[index % SUBJECT_ACCENTS.length],
                  )}
                >
                  <h3 className="text-display-sm">{subject.name}</h3>
                  <p className="text-fg-muted mt-2">{subject.description}</p>
                </li>
              ))}
            </ul>
            {teaching?.tutoring && <p className="mt-6 max-w-2xl font-bold">{teaching.tutoring}</p>}
            {has('educational-services') && (
              <Link href="/educational-services" className="btn-outline mt-6">
                More about what we teach
              </Link>
            )}
          </div>
        </section>
      )}

      {quotes?.feature?.text && (
        <section aria-label="A quote we teach by" className="dark-section section">
          <div className="container-site">
            <Quote text={quotes.feature.text} attribution={quotes.feature.attribution} size="lg" />
          </div>
        </section>
      )}

      {events.length > 0 ? (
        <section aria-labelledby="events-heading" className="tint-section section">
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
            <ul className="mt-8 grid gap-5">
              {events.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} calendarLink />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        // With nothing booked this is one line, not an empty section in the middle of the page.
        <section aria-labelledby="events-heading" className="tint-section">
          <div className="container-site flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-8">
            <div>
              <h2 id="events-heading" className="text-display-sm">
                Coming up
              </h2>
              <p className="text-fg-muted mt-1">
                No events are booked in just now. New dates are added here as soon as they are set.
              </p>
            </div>
            <Link href="/events" className="btn-outline">
              See past events
            </Link>
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section aria-labelledby="videos-heading" className="section">
          <div className="container-site">
            <h2 id="videos-heading" className="text-display-lg">
              See the school in action
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <li key={video.id}>
                  <VideoEmbed id={video.id} title={video.title} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {school?.address && (
        <section aria-labelledby="find-us-heading" className="tint-section section">
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
            {has('about') && (
              <Link href="/about" className="btn-outline mt-6">
                More about our history
              </Link>
            )}
            {quotes?.closing?.text && (
              <div className="mt-10 max-w-2xl">
                <Quote text={quotes.closing.text} attribution={quotes.closing.attribution} />
              </div>
            )}
          </div>
        </section>
      )}

      <CallToAction />
    </>
  )
}
