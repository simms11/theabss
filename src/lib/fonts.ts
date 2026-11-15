import { Abril_Fatface, Lato } from 'next/font/google'

/**
 * Two typefaces only. Abril Fatface is the display face the school
 * already used for its headings; Lato is the body face. Both are self-hosted by next/font at
 * build time: no third-party requests, no layout shift, `font-display: swap`.
 */
export const display = Abril_Fatface({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-abril',
  display: 'swap',
})

export const sans = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const fontClassNames = `${display.variable} ${sans.variable}`
