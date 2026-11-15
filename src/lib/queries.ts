import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@payload-config'
import { CACHE_TAGS } from '@/hooks/revalidate'
import { isUpcoming } from '@/lib/dates'
import type { Document, Event, Page, PageContent, SiteSetting } from '@/payload-types'

/**
 * All frontend reads go through this module so caching is in one place.
 * Each query is tagged; the CMS hooks revalidate the matching tag on publish,
 * so pages are static but never stale.
 */

const payloadClient = () => getPayload({ config })

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSetting> => {
    const payload = await payloadClient()
    return payload.findGlobal({ slug: 'site-settings', depth: 1 })
  },
  ['site-settings'],
  { tags: [CACHE_TAGS.settings], revalidate: 3600 },
)

/** The editable wording of the fixed pages and shared bands. */
export const getPageContent = unstable_cache(
  async (): Promise<PageContent> => {
    const payload = await payloadClient()
    return payload.findGlobal({ slug: 'page-content', depth: 0 })
  },
  ['page-content'],
  { tags: [CACHE_TAGS.settings], revalidate: 3600 },
)

/** Every published event, earliest first. Small enough (tens a year) to read in one go. */
const getPublishedEvents = unstable_cache(
  async (): Promise<Event[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'events',
      where: { _status: { equals: 'published' } },
      sort: 'start',
      limit: 500,
      pagination: false,
      depth: 1,
    })
    return docs
  },
  ['events'],
  // Publishing refreshes this at once (the tag). The 15-minute TTL is what moves an event
  // from upcoming to past when nobody has touched the CMS: no cron job needed.
  { tags: [CACHE_TAGS.events], revalidate: 900 },
)

/** Events that haven't finished yet, soonest first. */
export const getUpcomingEvents = async (limit?: number, now: Date = new Date()) => {
  const upcoming = (await getPublishedEvents()).filter((event) => isUpcoming(event, now))
  return limit ? upcoming.slice(0, limit) : upcoming
}

/** One published event, for its calendar file. */
export const getEventBySlug = async (slug: string): Promise<Event | null> =>
  (await getPublishedEvents()).find((event) => event.slug === slug) ?? null

/** Events that have finished, most recent first. */
export const getPastEvents = async (limit = 24, now: Date = new Date()) =>
  (await getPublishedEvents())
    .filter((event) => !isUpcoming(event, now))
    .reverse()
    .slice(0, limit)

/** Every form and document, in the order editors set within each category. */
export const getDocuments = unstable_cache(
  async (): Promise<Document[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'documents',
      sort: ['order', 'title'],
      limit: 200,
      pagination: false,
      depth: 0,
    })
    return docs
  },
  ['documents'],
  { tags: [CACHE_TAGS.documents], revalidate: 3600 },
)

export type PageLink = Pick<Page, 'id' | 'title' | 'slug' | 'navigation' | 'updatedAt'>

/** Published pages, for the menu, footer and sitemap. */
export const getPublishedPages = unstable_cache(
  async (): Promise<PageLink[]> => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'pages',
      where: { _status: { equals: 'published' } },
      sort: 'order',
      limit: 100,
      pagination: false,
      depth: 0,
      select: { title: true, slug: true, navigation: true, updatedAt: true },
    })
    return docs
  },
  ['pages'],
  { tags: [CACHE_TAGS.pages], revalidate: 3600 },
)

export const getPageBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<Page | null> => {
      const payload = await payloadClient()
      const { docs } = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slug }, _status: { equals: 'published' } },
        limit: 1,
        depth: 1,
      })
      return docs[0] ?? null
    },
    ['page', slug],
    { tags: [CACHE_TAGS.pages], revalidate: 3600 },
  )()
