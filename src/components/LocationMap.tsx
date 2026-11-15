import { directionsUrl, mapEmbedUrl, placeQuery } from '@/lib/maps'
import { cn } from '@/lib/utils'

/**
 * Where the school is: the address as text, how to get there, a directions link, and a
 * Google map with a pin.
 *
 * The address is real text first, so it can be copied, searched and read aloud; the map is
 * an extra. The frame has a title for screen readers and loads only when it is scrolled
 * near. Until then its box is tinted and says so, instead of looking like a blank hole.
 *
 * `layout="side"` puts the text beside the map (home page); `"stacked"` puts it above, for a
 * narrow column (contact page).
 */
export function LocationMap({
  venue,
  address,
  travel,
  layout = 'side',
}: {
  venue?: string | null
  address: string
  travel?: string | null
  layout?: 'side' | 'stacked'
}) {
  const query = placeQuery(venue, address)
  return (
    <div
      className={cn(
        'grid gap-6',
        layout === 'side' && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start',
      )}
    >
      <div>
        <address className="text-lg not-italic">
          {venue && <p className="font-bold">{venue}</p>}
          <p className="text-fg-muted whitespace-pre-line">{address}</p>
        </address>
        {travel && (
          <>
            <h3 className="eyebrow text-accent mt-5">Getting here</h3>
            <p className="mt-1 whitespace-pre-line">{travel}</p>
          </>
        )}
        <a href={directionsUrl(query)} rel="noopener noreferrer" className="btn-outline mt-5">
          Get directions
        </a>
      </div>
      <div
        className={cn(
          'rounded-card border-line bg-sand relative aspect-[4/3] overflow-hidden border',
          layout === 'side' && 'sm:aspect-[16/9]',
        )}
      >
        <p aria-hidden="true" className="text-fg-muted absolute inset-0 grid place-items-center">
          Loading map…
        </p>
        <iframe
          src={mapEmbedUrl(query)}
          title={`Map showing ${venue ?? 'the school'}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full"
        />
      </div>
    </div>
  )
}
