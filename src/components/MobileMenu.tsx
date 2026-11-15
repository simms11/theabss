'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * The menu on a phone: one "Menu" button instead of rows of links, so pages start with
 * their content. It is a native <details> element, so it opens with JavaScript off, is
 * announced as expanded or collapsed, and works from the keyboard. With JavaScript it also
 * closes after a link is followed and when Escape is pressed.
 */
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const details = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()

  // Following a link keeps the header on screen, so close the menu for the new page.
  useEffect(() => {
    details.current?.removeAttribute('open')
  }, [pathname])

  return (
    <details
      ref={details}
      className="group md:hidden"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && details.current?.open) {
          details.current.removeAttribute('open')
          details.current.querySelector('summary')?.focus()
        }
      }}
    >
      <summary className="border-paper/60 flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border-2 px-4 font-bold [&::-webkit-details-marker]:hidden">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path className="group-open:hidden" d="M4 7h16M4 12h16M4 17h16" />
          <path className="hidden group-open:block" d="M6 6l12 12M18 6L6 18" />
        </svg>
        Menu
      </summary>
      {children}
    </details>
  )
}
