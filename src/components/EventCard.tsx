import { PhotoGallery } from '@/components/PhotoGallery'
import { formatEventWhen } from '@/lib/dates'
import { EVENT_TYPE_LABELS } from '@/lib/eventTypes'
import { toGalleryPhotos } from '@/lib/photos'
import { asMedia, mediaSrc } from '@/lib/utils'
import type { Event } from '@/payload-types'

/**
 * One event, with everything a parent needs as real text: what, when, where, cost. The
 * flyer, when there is one, is a small picture beside the text, never a replacement for it.
 * Photos added after the event appear as a row of thumbnails.
 */
export function EventCard({
  event,
  headingLevel: Heading = 'h3',
  calendarLink = false,
}: {
  event: Event
  headingLevel?: 'h2' | 'h3'
  /** Offer "Add to calendar". For events that haven't happened yet. */
  calendarLink?: boolean
}) {
  // The flyer and the photos both open in the lightbox; neither replaces the text beside them.
  const flyer = toGalleryPhotos([event.flyer]).map((photo) => ({
    ...photo,
    thumb: mediaSrc(asMedia(event.flyer), 'card'),
  }))
  const photos = toGalleryPhotos(event.photos)
  return (
    <article className="card card-lift flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
      {flyer.length > 0 && (
        <PhotoGallery
          photos={flyer}
          label={event.title}
          layout="cover"
          className="w-full self-start sm:w-56"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-accent">{EVENT_TYPE_LABELS[event.type]}</p>
        <Heading className="text-display-sm mt-1">{event.title}</Heading>
        <dl className="mt-3 space-y-1">
          <div>
            <dt className="sr-only">When</dt>
            <dd className="font-bold">
              <time dateTime={event.start}>{formatEventWhen(event.start, event.end)}</time>
            </dd>
          </div>
          <div>
            <dt className="sr-only">Where</dt>
            <dd className="text-fg-muted">
              {event.venue}
              {event.address ? `, ${event.address.replace(/\s*\n\s*/g, ', ')}` : ''}
            </dd>
          </div>
          {event.price && (
            <div>
              <dt className="sr-only">Cost</dt>
              <dd className="text-fg-muted">{event.price}</dd>
            </div>
          )}
        </dl>
        <p className="mt-3">{event.summary}</p>
        {photos.length > 0 && (
          <div className="mt-4">
            <p className="eyebrow text-accent mb-2">Photos</p>
            <PhotoGallery photos={photos} label={event.title} />
          </div>
        )}
        {(event.bookingUrl || calendarLink) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {event.bookingUrl && (
              <a href={event.bookingUrl} rel="noopener noreferrer" className="btn-outline">
                Book a place<span className="sr-only"> for {event.title}</span>
              </a>
            )}
            {calendarLink && (
              <a href={`/events/${event.slug}/calendar.ics`} className="btn-outline">
                Add to calendar<span className="sr-only"> for {event.title}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
