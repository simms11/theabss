import { describe, expect, it } from 'vitest'

import { toGalleryPhotos } from '../../src/lib/photos'

const media = (id: number, extra: object = {}) => ({
  id,
  alt: `Photo ${id}`,
  url: `/api/media/file/${id}.webp`,
  width: 4000,
  height: 3000,
  sizes: {
    thumbnail: { url: `/api/media/file/${id}-400x400.webp`, width: 400, height: 400 },
    large: { url: `/api/media/file/${id}-1600x1200.webp`, width: 1600, height: 1200 },
  },
  ...extra,
})

describe('gallery photos', () => {
  it('uses the square crop for the thumbnail and the uncropped picture for the lightbox', () => {
    const [photo] = toGalleryPhotos([media(1, { caption: 'Sports day' })])
    expect(photo).toMatchObject({
      thumb: '/api/media/file/1-400x400.webp',
      full: '/api/media/file/1-1600x1200.webp',
      width: 1600,
      height: 1200,
      alt: 'Photo 1',
      caption: 'Sports day',
    })
  })

  it('falls back to the original for a small picture that has no large version', () => {
    const [photo] = toGalleryPhotos([media(2, { width: 640, height: 480, sizes: {} })])
    expect(photo).toMatchObject({ full: '/api/media/file/2.webp', width: 640, height: 480 })
  })

  // A photo deleted from the library leaves a bare id behind in the event.
  it('skips anything that is not a loaded image', () => {
    expect(toGalleryPhotos([7, null, undefined, media(3)]).map((photo) => photo.id)).toEqual([3])
    expect(toGalleryPhotos(undefined)).toEqual([])
  })
})
