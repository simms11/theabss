'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

/**
 * A menu link that marks itself as the current page, for sighted users (underline) and
 * screen readers (aria-current). A client component only because it needs the current path.
 */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const current = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center px-3 font-bold no-underline decoration-2 hover:underline',
        current && 'text-accent underline',
      )}
    >
      {children}
    </Link>
  )
}
