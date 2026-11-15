import type { MetadataRoute } from 'next'

import { getPublishedPages } from '@/lib/queries'
import { absoluteUrl } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getPublishedPages()
  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/events'), changeFrequency: 'weekly', priority: 0.8 },
    ...pages.map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: page.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
