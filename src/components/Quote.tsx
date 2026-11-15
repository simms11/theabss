import { cn } from '@/lib/utils'

/**
 * A quotation with its source, marked up as one: a figure holding a blockquote and a
 * caption, so a screen reader announces it as a quote and says who said it. The typographic quote marks are decoration and
 * hidden from screen readers, which already announce the blockquote.
 */
export function Quote({
  text,
  attribution,
  size = 'md',
}: {
  text: string
  attribution?: string | null
  size?: 'md' | 'lg'
}) {
  return (
    <figure className={cn(size === 'lg' && 'mx-auto max-w-4xl text-center')}>
      <blockquote
        className={cn('font-display', size === 'lg' ? 'text-display-lg' : 'text-display-sm')}
      >
        <p>
          <span aria-hidden="true">“</span>
          {text.trim()}
          <span aria-hidden="true">”</span>
        </p>
      </blockquote>
      {attribution && (
        <figcaption
          className={cn('text-accent font-bold', size === 'lg' ? 'mt-6 text-lg' : 'mt-3')}
        >
          <span aria-hidden="true">— </span>
          {attribution}
        </figcaption>
      )}
    </figure>
  )
}
