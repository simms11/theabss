import { describe, expect, it } from 'vitest'

import { DEFAULT_VIDEOS } from '../../src/globals/SiteSettings'
import { youtubeEmbedUrl, youtubeId, youtubeThumbnail } from '../../src/lib/youtube'

describe('YouTube videos', () => {
  it('reads the video id from every address format YouTube uses', () => {
    for (const url of [
      'https://www.youtube.com/watch?v=oz1rbWQd9_k',
      'https://youtube.com/watch?v=oz1rbWQd9_k&t=30s',
      'https://m.youtube.com/watch?v=oz1rbWQd9_k',
      'https://youtu.be/oz1rbWQd9_k?si=abc',
      'https://www.youtube.com/embed/oz1rbWQd9_k',
      'https://www.youtube.com/shorts/oz1rbWQd9_k',
      ' https://www.youtube-nocookie.com/embed/oz1rbWQd9_k ',
    ]) {
      expect(youtubeId(url), url).toBe('oz1rbWQd9_k')
    }
  })

  // The id goes into a frame address, so anything that isn't exactly an id is refused.
  it('refuses other sites, look-alikes and malformed ids', () => {
    for (const value of [
      'https://vimeo.com/123456789',
      'https://youtube.com.evil.example/watch?v=oz1rbWQd9_k',
      'https://www.youtube.com/watch?v=short',
      'https://www.youtube.com/watch?v=oz1rbWQd9_k"><script>',
      'http://www.youtube.com/watch?v=oz1rbWQd9_k',
      'https://www.youtube.com/@channel',
      'oz1rbWQd9_k',
      '',
      null,
    ]) {
      expect(youtubeId(value), String(value)).toBeNull()
    }
  })

  it('plays from the no-cookie domain and takes its still from YouTube’s image host', () => {
    expect(youtubeEmbedUrl('oz1rbWQd9_k')).toBe(
      'https://www.youtube-nocookie.com/embed/oz1rbWQd9_k?autoplay=1&rel=0',
    )
    expect(youtubeThumbnail('oz1rbWQd9_k')).toBe('https://i.ytimg.com/vi/oz1rbWQd9_k/hqdefault.jpg')
  })

  it('ships with valid default videos', () => {
    expect(DEFAULT_VIDEOS.every((video) => youtubeId(video.url))).toBe(true)
  })
})
