'use client'

import Image from 'next/image'
import { useState } from 'react'

import { youtubeEmbedUrl, youtubeThumbnail } from '@/lib/youtube'

/**
 * A YouTube video that loads only when played. Until then it is a still image inside a
 * button, so it is reachable by keyboard and announced as "Play video: <title>". Pressing it
 * swaps in the player, which starts straight away and has a title for screen readers.
 */
export function VideoEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <figure>
      <div className="rounded-card bg-ink relative aspect-video overflow-hidden">
        {playing ? (
          <iframe
            src={youtubeEmbedUrl(id)}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 size-full cursor-pointer"
          >
            <Image
              src={youtubeThumbnail(id)}
              alt=""
              fill
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />
            <span
              aria-hidden="true"
              className="bg-gold text-ink absolute top-1/2 left-1/2 flex size-16 -translate-1/2 items-center justify-center rounded-full transition-transform group-hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 font-bold">{title}</figcaption>
    </figure>
  )
}
