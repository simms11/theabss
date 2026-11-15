'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

/**
 * A menu link that marks itself as the current page, for sighted users (underline) and
 * screen readers (aria-current). A client component only because it needs the current path.
 * `block` makes it a full-width row, for the phone menu.
 */
export function NavLink({
  href,
  block = false,
  children,
}: {
  href: string
  block?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const current = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'min-h-11 items-center font-bold no-underline decoration-2 hover:underline',
        block ? 'flex w-full py-2 text-lg' : 'inline-flex px-3',
        current && 'text-accent underline',
      )}
    >
      {children}
    </Link>
  )
}
