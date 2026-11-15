import Link from 'next/link'

import { NavLink } from '@/components/NavLink'
import type { PageLink } from '@/lib/queries'
import type { SiteSetting } from '@/payload-types'

/**
 * Site header. The menu is always visible and wraps on a phone, so every page is one tap
 * away without opening anything. It lists Home, Events, the pages an editor has placed in
 * the main menu, and Contact, so the menu can't link to a page that doesn't exist.
 */
export function Header({ settings, pages }: { settings: SiteSetting; pages: PageLink[] }) {
  return (
    <header className="dark-section">
      <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3">
        <Link
          href="/"
          className="font-display inline-flex min-h-11 items-center gap-3 text-xl no-underline"
        >
          <span className="text-accent">{settings.shortName}</span>
          <span className="sr-only sm:not-sr-only">{settings.siteName}</span>
        </Link>
        <nav aria-label="Main">
          <ul className="-mx-3 flex flex-wrap items-center">
            <li>
              <NavLink href="/">Home</NavLink>
            </li>
            <li>
              <NavLink href="/events">Events</NavLink>
            </li>
            {pages.map((page) => (
              <li key={page.id}>
                <NavLink href={`/${page.slug}`}>{page.title}</NavLink>
              </li>
            ))}
            <li>
              <NavLink href="/contact">Contact</NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="pan-stripe" aria-hidden="true" />
    </header>
  )
}
