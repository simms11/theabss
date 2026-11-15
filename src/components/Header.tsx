import Link from 'next/link'

import { MobileMenu } from '@/components/MobileMenu'
import { NavLink } from '@/components/NavLink'
import type { PageLink } from '@/lib/queries'
import type { SiteSetting } from '@/payload-types'

/**
 * Site header. The menu lists Home, Events, the pages an editor has placed in the main
 * menu, and Contact, so it can't link to a page that doesn't exist.
 *
 * From tablet width up the links sit in a row. On a phone they are behind one "Menu"
 * button, so the header is a single line and each page starts with its content. Only one
 * of the two is ever displayed, so screen readers meet one "Main" navigation.
 */
export function Header({ settings, pages }: { settings: SiteSetting; pages: PageLink[] }) {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    ...pages.map((page) => ({ href: `/${page.slug}`, label: page.title })),
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="dark-section">
      <div className="container-site relative flex items-center justify-between gap-x-6 py-3">
        <Link
          href="/"
          className="font-display inline-flex min-h-11 items-center gap-3 text-xl no-underline"
        >
          <span className="text-accent">{settings.shortName}</span>
          <span className="sr-only lg:not-sr-only">{settings.siteName}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="-mx-3 flex flex-wrap items-center justify-end">
            {links.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu>
          <nav
            aria-label="Main"
            className="bg-ink border-ink-800 absolute inset-x-0 top-full z-50 border-t pb-3 shadow-lg"
          >
            <ul className="container-site">
              {links.map((link) => (
                <li key={link.href} className="border-ink-800 border-b last:border-b-0">
                  <NavLink href={link.href} block>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </MobileMenu>
      </div>
      <div className="pan-stripe" aria-hidden="true" />
    </header>
  )
}
