'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

import type { GalleryPhoto } from '@/lib/photos'
import { cn } from '@/lib/utils'

/** How many thumbnails a strip shows before the rest are folded into "+N". */
const VISIBLE = 4

/**
 * Photos that open in a lightbox. Each thumbnail is a button, so the gallery works from the
 * keyboard. The lightbox is a native modal <dialog>: the browser keeps focus inside it,
 * closes it on Escape and returns focus to the thumbnail that opened it. Left and right
 * arrows move between photos, and the position ("Photo 2 of 5") is announced as it changes.
 *
 * `layout="strip"` shows a row of small thumbnails (an event's photos). `layout="cover"`
 * shows one larger picture (an event's flyer) that opens to full size.
 */
export function PhotoGallery({
  photos,
  label,
  layout = 'strip',
  className,
}: {
  photos: GalleryPhoto[]
  /** What the photos are of, e.g. the event's title. Used in the buttons' names. */
  label: string
  layout?: 'strip' | 'cover'
  className?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState<number | null>(null)
  if (photos.length === 0) return null

  const open = (at: number) => {
    setIndex(at)
    dialog.current?.showModal()
  }
  const step = (by: number) =>
    setIndex((current) =>
      current === null ? current : (current + by + photos.length) % photos.length,
    )
  const current = index === null ? null : photos[index]
  const hidden = photos.length - VISIBLE

  return (
    <>
      {layout === 'cover' ? (
        <button
          type="button"
          onClick={() => open(0)}
          aria-label={`View larger: ${photos[0].alt}`}
          className={cn('group rounded-card block cursor-zoom-in overflow-hidden', className)}
        >
          <Image
            src={photos[0].thumb}
            alt={photos[0].alt}
            width={768}
            height={576}
            sizes="(min-width: 640px) 14rem, 100vw"
            className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </button>
      ) : (
        <ul className={cn('flex flex-wrap gap-2', className)}>
          {photos.slice(0, VISIBLE).map((photo, at) => {
            const isLast = at === VISIBLE - 1 && hidden > 0
            return (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => open(at)}
                  aria-label={
                    isLast
                      ? `View all ${photos.length} photos of ${label}`
                      : `View photo ${at + 1} of ${photos.length}: ${photo.alt}`
                  }
                  className="group rounded-card relative block size-20 cursor-zoom-in overflow-hidden sm:size-24"
                >
                  <Image
                    src={photo.thumb}
                    alt=""
                    fill
                    sizes="6rem"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {isLast && (
                    <span
                      aria-hidden="true"
                      className="bg-ink/70 text-paper absolute inset-0 grid place-items-center text-lg font-bold"
                    >
                      +{hidden}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <dialog
        ref={dialog}
        aria-label={`Photos: ${label}`}
        onClose={() => setIndex(null)}
        onClick={(event) => {
          // A click on the dimmed area around the photo closes it.
          if (event.target === dialog.current) dialog.current?.close()
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') step(1)
          if (event.key === 'ArrowLeft') step(-1)
        }}
        // A solid panel, so its text has a known background whatever page is behind it.
        className="lightbox dark-section rounded-card m-auto w-full max-w-5xl p-4 sm:p-6"
      >
        {current && (
          <figure className="flex flex-col items-center gap-3">
            <Image
              key={current.id}
              src={current.full}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="rounded-card max-h-[75vh] w-auto object-contain"
            />
            <figcaption className="text-center">
              {current.caption || current.alt}
              {photos.length > 1 && (
                <span role="status" className="text-fg-muted block text-sm">
                  Photo {(index ?? 0) + 1} of {photos.length}
                </span>
              )}
            </figcaption>
            <div className="flex flex-wrap justify-center gap-3">
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} className="btn-outline">
                    Previous
                  </button>
                  <button type="button" onClick={() => step(1)} className="btn-outline">
                    Next
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className="btn-primary"
                autoFocus
              >
                Close
              </button>
            </div>
          </figure>
        )}
      </dialog>
    </>
  )
}
