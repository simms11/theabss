/**
 * Google Maps links built from the school's address in Site Settings, so the map, the
 * directions link and the footer can't disagree. No API key: these are Google's public
 * search and directions addresses.
 */
const GOOGLE_MAPS = 'https://www.google.com/maps'

/** "City Heights E-ACT Academy, 33 Abbots Park, London SW2 3PW" */
export const placeQuery = (venue: string | null | undefined, address: string): string =>
  [venue, ...address.split(/\r?\n/)]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')

/** A map with a pin on the place, for an <iframe>. */
export const mapEmbedUrl = (query: string): string =>
  `${GOOGLE_MAPS}?q=${encodeURIComponent(query)}&z=16&output=embed`

/** Opens directions to the place in Google Maps, or the Maps app on a phone. */
export const directionsUrl = (query: string): string =>
  `${GOOGLE_MAPS}/dir/?api=1&destination=${encodeURIComponent(query)}`
