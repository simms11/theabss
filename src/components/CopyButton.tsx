'use client'

import { useState } from 'react'

/**
 * Copies a value, such as a sort code, so it can be pasted into a banking app without
 * retyping. The result is announced to screen readers and shown for a moment. If the
 * browser refuses clipboard access, the value beside the button can still be selected.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        // The spoken name always contains the visible word, as speech-control users say what they see.
        aria-label={copied ? `Copied ${label.toLowerCase()}` : `Copy ${label.toLowerCase()}`}
        className="border-ink hover:bg-sand inline-flex min-h-11 min-w-20 items-center justify-center rounded-full border-2 px-3 text-sm font-bold"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span role="status" className="sr-only">
        {copied ? `${label} copied` : ''}
      </span>
    </>
  )
}
