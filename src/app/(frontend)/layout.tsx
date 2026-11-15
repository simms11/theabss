import type { Metadata, Viewport } from 'next'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { fontClassNames } from '@/lib/fonts'
import { getPublishedPages, getSiteSettings } from '@/lib/queries'
import { SITE_URL } from '@/lib/utils'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${settings.siteName} (${settings.shortName}) · Saturday school in South London`,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.description ?? undefined,
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      locale: 'en_GB',
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: './' },
    robots: { index: true, follow: true },
  }
}

export const viewport: Viewport = {
  // Must be a literal (it's a <meta> tag); matches --color-ink, the header.
  themeColor: '#14110f',
  // The palette is designed, not inverted: stop phone browsers' auto dark mode recolouring it.
  colorScheme: 'only light',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, pages] = await Promise.all([getSiteSettings(), getPublishedPages()])

  return (
    <html lang="en-GB" className={fontClassNames}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header settings={settings} pages={pages.filter((p) => p.navigation === 'header')} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} pages={pages.filter((p) => p.navigation !== 'none')} />
      </body>
    </html>
  )
}
