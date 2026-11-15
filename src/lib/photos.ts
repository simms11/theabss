import { asMedia, mediaSrc } from '@/lib/utils'

export type GalleryPhoto = {
  id: number | string
  /** Small square crop, for the thumbnail. */
  thumb: string
  /** The whole picture, uncropped, for the lightbox. */
  full: string
  width: number
  height: number
  alt: string
  caption?: string | null
}

/**
 * Turns a list of uploads (as an event's photos arrive from the CMS) into what the gallery
 * needs. Anything that isn't a populated image, such as a photo since deleted, is dropped.
 */
export const toGalleryPhotos = (values: unknown[] | null | undefined): GalleryPhoto[] =>
  (values ?? []).flatMap((value) => {
    const media = asMedia(value)
    if (!media) return []
    const large = media.sizes?.large
    return [
      {
        id: media.id,
        thumb: mediaSrc(media, 'thumbnail'),
        full: mediaSrc(media, 'large'),
        width: large?.width ?? media.width ?? 1600,
        height: large?.height ?? media.height ?? 1200,
        alt: media.alt,
        caption: media.caption,
      },
    ]
  })
