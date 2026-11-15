import { describe, expect, it } from 'vitest'

import { PAGES } from '../../scripts/content/pages'
import { toLexical } from '../../scripts/lib/lexical'
import { ENQUIRY_RETENTION_MONTHS } from '../../src/lib/enquiry'
import { LEGACY_PAGES } from '../../src/lib/legacyRedirects'

type Node = { type: string; tag?: string; text?: string; format?: number; children?: Node[] }

const nodes = (source: string) => toLexical(source).root.children as Node[]
const text = (node: Node): string =>
  node.text ??
  (node.children ?? []).map((child) => (child.type === 'linebreak' ? '\n' : text(child))).join('')

describe('seeded page content', () => {
  it('turns "> " lines into one quotation, with the source on its own line', () => {
    const [quote, paragraph] = nodes('> Words worth keeping.\n> — Who said them\n\nA paragraph.')
    expect(quote.type).toBe('quote')
    expect(text(quote)).toBe('Words worth keeping.\n— Who said them')
    expect(paragraph.type).toBe('paragraph')
    // The source line is italic, which the site styles as a label under the quote.
    const formats = (quote.children ?? []).filter((n) => n.type === 'text').map((n) => n.format)
    expect(formats).toEqual([0, 2])
  })

  it('turns headings, lists and paragraphs into their own blocks', () => {
    const [h2, h3, list] = nodes('## Two\n\n### Three\n\n- a\n- b')
    expect([h2.tag, h3.tag]).toEqual(['h2', 'h3'])
    expect(list.children).toHaveLength(2)
  })

  describe('the school’s core pages', () => {
    const MENU_PAGES = PAGES.filter((page) => page.navigation !== 'footer')

    it('each open with a quotation and never use an h1 (the title is the h1)', () => {
      for (const page of MENU_PAGES) {
        const content = nodes(page.content)
        expect(content[0].type, page.slug).toBe('quote')
        expect(content.filter((n) => n.type === 'heading').every((n) => n.tag !== 'h1')).toBe(true)
      }
    })

    it('live at the addresses the legacy redirects point to', () => {
      const destinations = new Set(Object.values(LEGACY_PAGES))
      for (const page of MENU_PAGES) {
        expect(destinations.has(`/${page.slug}`), page.slug).toBe(true)
      }
    })

    // The privacy notice states the retention period; it must match what the site enforces.
    it('include a privacy notice that matches how long enquiries are really kept', () => {
      const privacy = PAGES.find((page) => page.slug === 'privacy')
      expect(privacy?.navigation).toBe('footer')
      expect(privacy?.content).toContain(`after ${ENQUIRY_RETENTION_MONTHS} months`)
    })

    it('carry the school’s quotations', () => {
      const all = PAGES.map((page) => page.content).join('\n')
      for (const words of [
        'passport to the future',
        'Up, you mighty race',
        'like a tree without roots',
        'kill the revolution',
      ]) {
        expect(all).toContain(words)
      }
    })
  })
})
