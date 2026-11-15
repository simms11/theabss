import Link from 'next/link'

import type { PageLink } from '@/lib/queries'
import { SocialLinks } from '@/components/SocialLinks'
import { socialLinksFrom } from '@/lib/social'
import type { SiteSetting } from '@/payload-types'

export function Footer({ settings, pages }: { settings: SiteSetting; pages: PageLink[] }) {
  const { school, social, contactEmail, phone } = settings
  const socialLinks = socialLinksFrom(social)

  return (
    <footer className="dark-section">
      <div className="pan-stripe" aria-hidden="true" />
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="text-display-sm">{settings.siteName}</h2>
          {settings.tagline && <p className="text-fg-muted mt-2">{settings.tagline}</p>}
          <SocialLinks links={socialLinks} className="mt-4" />
        </div>

        <div>
          <h2 className="eyebrow text-accent">Find us</h2>
          <address className="text-fg-muted mt-3 not-italic">
            {school?.venue && <p>{school.venue}</p>}
            {school?.address && <p className="whitespace-pre-line">{school.address}</p>}
            {contactEmail && (
              <p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-fg inline-flex min-h-11 items-center"
                >
                  {contactEmail}
                </a>
              </p>
            )}
            {phone && (
              <p>
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="text-fg inline-flex min-h-11 items-center"
                >
                  {phone}
                </a>
              </p>
            )}
          </address>
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow text-accent">More</h2>
          <ul className="mt-1">
            {[
              { href: '/contact', label: 'Contact' },
              { href: '/payment', label: 'Fees and payment' },
              { href: '/forms', label: 'Forms and documents' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center">
                  {link.label}
                </Link>
              </li>
            ))}
            {pages.map((page) => (
              <li key={page.id}>
                <Link href={`/${page.slug}`} className="inline-flex min-h-11 items-center">
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-line border-t">
        <p className="container-site text-fg-muted py-4 text-sm">
          © {new Date().getFullYear()} {settings.siteName}
          {school?.founded ? `. Teaching since ${school.founded}.` : ''}
        </p>
      </div>
    </footer>
  )
}
