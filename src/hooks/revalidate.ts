import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

import {
  revalidatePath as nextRevalidatePath,
  revalidateTag as nextRevalidateTag,
} from 'next/cache'

import type { Document, Event, Page } from '@/payload-types'

/**
 * Pages are statically generated and revalidated on publish, so the school never needs a
 * redeploy to see changes. Cache tags:
 *  - events   — the home page's upcoming list and the events page
 *  - settings — site-wide settings (header, key facts, footer, contact)
 *  - pages    — standalone pages and the menu links to them
 *  - documents — the downloads on the Forms page
 */
export const CACHE_TAGS = {
  events: 'events',
  settings: 'settings',
  pages: 'pages',
  documents: 'documents',
} as const

/**
 * Outside a Next request (CLI scripts, tests) there is no cache to clear and Next throws.
 * A failed cache refresh must never roll back the content write it follows, so log it; the
 * cache TTL in src/lib/queries.ts is the backstop.
 */
const safely = (payload: Payload, what: string, fn: () => void) => {
  try {
    fn()
  } catch (err) {
    payload.logger.warn(`Skipped revalidating ${what}: ${(err as Error).message}`)
  }
}

export const revalidatePath = (payload: Payload, path: string, type?: 'layout' | 'page') =>
  safely(payload, path, () => nextRevalidatePath(path, type))

/**
 * `expire: 0` means the next request waits for fresh data and never gets the previous
 * version. An editor who publishes and then reloads the page must see their change; with
 * the default profile the first reload would still show the old content.
 */
export const revalidateTag = (payload: Payload, tag: string) =>
  safely(payload, `tag ${tag}`, () => nextRevalidateTag(tag, { expire: 0 }))

/**
 * Nothing public changed when a document wasn't live before and still isn't (a draft save).
 * Publishing, editing a live document and unpublishing all refresh the cache.
 */
const touchesLiveContent = (
  doc: { _status?: string | null } | undefined,
  previousDoc: { _status?: string | null } | undefined,
) => doc?._status === 'published' || previousDoc?._status === 'published'

export const revalidateEvent: CollectionAfterChangeHook<Event> &
  CollectionAfterDeleteHook<Event> = (args) => {
  const { doc, req } = args
  if (req.context.disableRevalidate) return doc
  const previousDoc = 'previousDoc' in args ? (args.previousDoc as Event | undefined) : doc
  if (!touchesLiveContent(doc, previousDoc)) return doc
  revalidateTag(req.payload, CACHE_TAGS.events)
  return doc
}

export const revalidatePage: CollectionAfterChangeHook<Page> & CollectionAfterDeleteHook<Page> = (
  args,
) => {
  const { doc, req } = args
  if (req.context.disableRevalidate) return doc
  const previousDoc = 'previousDoc' in args ? (args.previousDoc as Page | undefined) : doc
  if (!touchesLiveContent(doc, previousDoc)) return doc
  for (const slug of new Set([doc?.slug, previousDoc?.slug])) {
    if (slug) revalidatePath(req.payload, `/${slug}`)
  }
  revalidateTag(req.payload, CACHE_TAGS.pages)
  // Menu and footer links to pages appear on every page.
  revalidatePath(req.payload, '/', 'layout')
  return doc
}

export const revalidateDocument: CollectionAfterChangeHook<Document> &
  CollectionAfterDeleteHook<Document> = ({ doc, req: { context, payload } }) => {
  if (context.disableRevalidate) return doc
  revalidateTag(payload, CACHE_TAGS.documents)
  return doc
}

export const revalidateSettings: GlobalAfterChangeHook = ({ doc, req: { context, payload } }) => {
  if (context.disableRevalidate) return doc
  revalidateTag(payload, CACHE_TAGS.settings)
  revalidatePath(payload, '/', 'layout')
  return doc
}
