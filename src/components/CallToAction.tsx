import Link from 'next/link'

import { getPageContent } from '@/lib/queries'

/**
 * The band that closes a page, so no page ends at a dead end: whatever a parent has just
 * read, the next step is to ask about a place. The wording is edited in the admin under
 * Page wording.
 */
export async function CallToAction() {
  const { invitation } = await getPageContent()
  return (
    <section aria-labelledby="cta-heading" className="tint-section">
      <div className="container-site flex flex-wrap items-center justify-between gap-x-10 gap-y-5 py-12">
        <div>
          <h2 id="cta-heading" className="text-display-md">
            {invitation?.heading}
          </h2>
          {invitation?.text && <p className="mt-2 max-w-xl">{invitation.text}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn-solid">
            Ask about a place
          </Link>
          <Link href="/payment" className="btn-outline">
            See fees
          </Link>
        </div>
      </div>
    </section>
  )
}
