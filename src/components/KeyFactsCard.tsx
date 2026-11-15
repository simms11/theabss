import Link from 'next/link'

import type { KeyFact } from '@/lib/keyFacts'

/**
 * The key facts as a card beside a text page, so a parent reading About or School Life
 * always has the practical answers, and the way to get in touch, in view.
 */
export function KeyFactsCard({ facts }: { facts: KeyFact[] }) {
  if (facts.length === 0) return null
  return (
    <aside aria-labelledby="at-a-glance-heading" className="card border-t-gold border-t-4 p-6">
      <h2 id="at-a-glance-heading" className="text-display-sm">
        At a glance
      </h2>
      <dl className="mt-4 space-y-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="eyebrow text-accent">{fact.label}</dt>
            <dd className="mt-1 font-bold">
              {fact.value}
              {fact.href && (
                <Link href={fact.href} className="text-accent block min-h-11 pt-1 font-bold">
                  {fact.linkText}
                </Link>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <Link href="/contact" className="btn-solid mt-5 w-full">
        Ask about a place
      </Link>
    </aside>
  )
}
