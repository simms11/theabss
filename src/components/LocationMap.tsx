import { directionsUrl, mapEmbedUrl, placeQuery } from '@/lib/maps'

/**
 * Where the school is: the address as text, a directions link, and a Google map with a pin.
 *
 * The address is real text first, so it can be copied, searched and read aloud; the map is
 * an extra. The frame has a title for screen readers and loads only when it is scrolled
 * near (it sits low on the page), so it costs nothing for visitors who don't reach it.
 */
export function LocationMap({ venue, address }: { venue?: string | null; address: string }) {
  const query = placeQuery(venue, address)
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
      <div>
        <address className="text-lg not-italic">
          {venue && <p className="font-bold">{venue}</p>}
          <p className="text-fg-muted whitespace-pre-line">{address}</p>
        </address>
        <a href={directionsUrl(query)} rel="noopener noreferrer" className="btn-outline mt-5">
          Get directions
        </a>
      </div>
      <iframe
        src={mapEmbedUrl(query)}
        title={`Map showing ${venue ?? 'the school'}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="rounded-card border-line aspect-[4/3] w-full border sm:aspect-[16/9]"
      />
    </div>
  )
}
