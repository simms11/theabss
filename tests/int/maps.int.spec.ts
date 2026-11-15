import { describe, expect, it } from 'vitest'

import { directionsUrl, mapEmbedUrl, placeQuery } from '../../src/lib/maps'

describe('map links', () => {
  const query = placeQuery('City Heights E-ACT Academy', '33 Abbots Park\nLondon SW2 3PW')

  it('joins the venue and a multi-line address into one search', () => {
    expect(query).toBe('City Heights E-ACT Academy, 33 Abbots Park, London SW2 3PW')
    expect(placeQuery(null, ' 33 Abbots Park \r\n\r\n London SW2 3PW ')).toBe(
      '33 Abbots Park, London SW2 3PW',
    )
  })

  it('pins the place on an embeddable map', () => {
    const url = new URL(mapEmbedUrl(query))
    expect(url.origin).toBe('https://www.google.com')
    expect(url.searchParams.get('q')).toBe(query)
    expect(url.searchParams.get('output')).toBe('embed')
  })

  it('links to directions to the same place', () => {
    const url = new URL(directionsUrl(query))
    expect(url.pathname).toBe('/maps/dir/')
    expect(url.searchParams.get('destination')).toBe(query)
  })

  // The address is typed by an editor: it must not be able to add parameters to the link.
  it('encodes the address', () => {
    expect(mapEmbedUrl('1 High St & Co?x=1#y')).toContain('q=1%20High%20St%20%26%20Co%3Fx%3D1%23y&')
  })
})
