import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CallToAction } from '@/components/CallToAction'
import { KeyFactsCard } from '@/components/KeyFactsCard'
import { keyFacts } from '@/lib/keyFacts'
import { getPageBySlug, getPublishedPages, getSiteSettings } from '@/lib/queries'

type Props = { params: Promise<{ slug: string }> }

/** Published pages are built ahead of time; one published later is built on first visit. */
export async function generateStaticParams() {
  return (await getPublishedPages()).map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageBySlug((await params).slug)
  if (!page) return {}
  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || page.intro || undefined,
  }
}

export default async function StandalonePage({ params }: Props) {
  const [page, settings] = await Promise.all([
    getPageBySlug((await params).slug),
    getSiteSettings(),
  ])
  if (!page) notFound()

  return (
    <>
      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">{page.title}</h1>
          {page.intro && <p className="text-fg-muted mt-3 max-w-2xl text-lg">{page.intro}</p>}
        </div>
      </section>
      <section className="section">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,42rem)_minmax(0,20rem)] lg:justify-between">
          <RichText data={page.content} className="prose-page" />
          <div className="lg:sticky lg:top-6 lg:self-start">
            <KeyFactsCard facts={keyFacts(settings).filter((fact) => fact.label !== 'What')} />
          </div>
        </div>
      </section>
      <CallToAction />
    </>
  )
}
