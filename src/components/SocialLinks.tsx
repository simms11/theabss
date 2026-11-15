import type { SocialLink, SocialNetwork } from '@/lib/social'
import { cn } from '@/lib/utils'

/** Each network's mark, drawn on a 24 × 24 grid in the current text colour. */
const ICONS: Record<SocialNetwork, React.ReactNode> = {
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </g>
  ),
  x: (
    <path
      fill="currentColor"
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
    />
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
      <path d="M10 9l5 3-5 3z" fill="var(--color-bg)" />
    </>
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.3v2.4H7.5V14h2.7v8z"
    />
  ),
}

/**
 * The school's social accounts as their logos. Each is a link with the network's name as
 * its accessible name (the logo alone says nothing to a screen reader), in a 44px target.
 */
export function SocialLinks({ links, className }: { links: SocialLink[]; className?: string }) {
  if (links.length === 0) return null
  return (
    <ul className={cn('-ml-2.5 flex flex-wrap gap-1', className)}>
      {links.map((link) => (
        <li key={link.network}>
          <a
            href={link.href}
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className="hover:text-accent inline-flex size-11 items-center justify-center rounded-full transition-colors"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
              {ICONS[link.network]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
