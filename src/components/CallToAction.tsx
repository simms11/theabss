import Link from 'next/link'

/**
 * The band that closes a page, so no page ends at a dead end: whatever a parent has just
 * read, the next step is to ask about a place.
 */
export function CallToAction() {
  return (
    <section aria-labelledby="cta-heading" className="tint-section">
      <div className="container-site flex flex-wrap items-center justify-between gap-x-10 gap-y-5 py-12">
        <div>
          <h2 id="cta-heading" className="text-display-md">
            Would you like a place for your child?
          </h2>
          <p className="mt-2 max-w-xl">
            Tell us your child’s age and we’ll reply by email. You’re welcome to visit on a Saturday
            first.
          </p>
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
