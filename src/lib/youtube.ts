/**
 * The school's videos live on its YouTube channel. The site shows each as a still image
 * with a play button; YouTube's player is only loaded when someone presses play, and then
 * from youtube-nocookie.com. So a visitor who doesn't watch is never connected to YouTube's
 * player, and pages stay light.
 */
const ID = /^[\w-]{11}$/

/** The video id from any of YouTube's address formats, or null. */
export const youtubeId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value.trim())
    const host = url.hostname.replace(/^(www|m)\./, '')
    let id: string | null = null
    if (host === 'youtu.be') id = url.pathname.slice(1)
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const [, kind, rest] = url.pathname.split('/')
      id =
        kind === 'watch'
          ? url.searchParams.get('v')
          : ['embed', 'shorts', 'live'].includes(kind)
            ? rest
            : null
    }
    return url.protocol === 'https:' && id && ID.test(id) ? id : null
  } catch {
    return null
  }
}

/** The still image YouTube publishes for a video (480 × 360). */
export const youtubeThumbnail = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

/** The player, without cookies until played, starting at once because play was pressed. */
export const youtubeEmbedUrl = (id: string): string =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
