import type { Metadata } from 'next'
import Link from 'next/link'

import { DOCUMENT_CATEGORIES } from '@/collections/Documents'
import { fileTypeLabel, formatFileSize } from '@/lib/files'
import { getDocuments, getPageContent } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Forms and documents',
  description:
    'Application form, school rules, policies and guides for parents of the Afruika Bantu Saturday School.',
}

export default async function FormsPage() {
  const [documents, content] = await Promise.all([getDocuments(), getPageContent()])
  const groups = DOCUMENT_CATEGORIES.map((category) => ({
    ...category,
    documents: documents.filter((document) => document.category === category.value),
  })).filter((group) => group.documents.length > 0)

  return (
    <>
      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">Forms and documents</h1>
          {content.intros?.forms && (
            <p className="text-fg-muted mt-3 max-w-2xl text-lg">{content.intros.forms}</p>
          )}
        </div>
      </section>

      {groups.length === 0 ? (
        <section className="section">
          <div className="container-site">
            <h2 className="text-display-md">Ask us for a form</h2>
            <p className="mt-3 max-w-prose">
              Forms will be listed here to download. Until then, get in touch and we’ll send you
              what you need, including the application form.
            </p>
            <Link href="/contact" className="btn-solid mt-6">
              Contact us
            </Link>
          </div>
        </section>
      ) : (
        groups.map((group, index) => (
          <section
            key={group.value}
            aria-labelledby={`${group.value}-heading`}
            className={index % 2 === 1 ? 'tint-section section' : 'section'}
          >
            <div className="container-site">
              <h2 id={`${group.value}-heading`} className="text-display-md">
                {group.label}
              </h2>
              <ul className="mt-6 grid gap-4 lg:grid-cols-2">
                {group.documents.map((document) => {
                  const type = fileTypeLabel(document.mimeType, document.filename)
                  const size = formatFileSize(document.filesize)
                  return (
                    <li key={document.id} className="card card-lift reveal flex flex-col p-5">
                      <h3 className="text-display-sm">{document.title}</h3>
                      {document.description && (
                        <p className="text-fg-muted mt-1">{document.description}</p>
                      )}
                      {/* The link says what it opens and how big it is, before it is followed. */}
                      <a href={document.url ?? '#'} className="btn-outline mt-4 self-start">
                        Download<span className="sr-only"> {document.title}</span> ({type}
                        {size ? `, ${size}` : ''})
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        ))
      )}
    </>
  )
}
