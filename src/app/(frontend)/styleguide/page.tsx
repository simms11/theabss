import type { Metadata } from 'next'

import { EventCard } from '@/components/EventCard'
import { Quote } from '@/components/Quote'
import type { Event } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Styleguide',
  robots: { index: false, follow: false },
}

/** Measured contrast ratios (WCAG 2.2). AA needs 4.5:1 for text, 3:1 for large text. */
const PAIRINGS = [
  {
    surface: 'Paper',
    className: '',
    rows: [
      ['Ink', 'text-ink', '17.4:1', 'Body text'],
      ['Stone', 'text-stone', '7.1:1', 'Secondary text'],
      ['Red', 'text-red', '6.7:1', 'Links, labels'],
      ['Green', 'text-green', '4.75:1', 'Labels'],
      ['Gold 700', 'text-gold-700', '4.9:1', 'Labels (plain gold fails here)'],
    ],
  },
  {
    surface: 'Black',
    className: 'dark-section',
    rows: [
      ['Paper', 'text-paper', '17.4:1', 'Body text'],
      ['Mist', 'text-mist', '11.1:1', 'Secondary text'],
      ['Gold', 'text-gold', '9.6:1', 'Labels, headings'],
      ['Green 300', 'text-green-300', '8.8:1', 'Labels'],
      ['Red 300', 'text-red-300', '7.8:1', 'Labels (brand red is 2.3:1: shapes only)'],
    ],
  },
  {
    surface: 'Red',
    className: 'red-section',
    rows: [
      ['Paper', 'text-paper', '8.4:1', 'Body text'],
      ['Gold', 'text-gold', '4.6:1', 'Headings and large text'],
    ],
  },
] as const

const SAMPLE_EVENT = {
  id: 0,
  title: 'Parents’ and Ancestors’ Day',
  slug: 'sample',
  type: 'community',
  start: '2027-06-05T13:00:00.000Z',
  end: '2027-06-05T19:00:00.000Z',
  venue: 'Example Hall',
  address: '1 Example Road\nLondon SW2',
  summary:
    'A sample card. The date, venue, cost and summary are all real text, so they can be read on a phone, searched and read aloud.',
  price: 'Free',
  bookingUrl: 'https://example.com',
  updatedAt: '',
  createdAt: '',
} as unknown as Event

/** The design system on one page: colours with their contrast, type, buttons, components. */
export default function Styleguide() {
  return (
    <>
      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">Styleguide</h1>
          <p className="text-fg-muted mt-3 max-w-2xl text-lg">
            The colours, type and components the site is built from. Tokens live in globals.css.
          </p>
        </div>
      </section>

      <section aria-labelledby="colour-heading" className="section">
        <div className="container-site">
          <h2 id="colour-heading" className="text-display-md">
            Colour and contrast
          </h2>
          <p className="text-fg-muted mt-2 max-w-2xl">
            Three surfaces. Each colour is listed only on the surfaces where it passes WCAG AA.
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {PAIRINGS.map((group) => (
              <div key={group.surface} className={`card p-5 ${group.className}`}>
                <h3 className="text-display-sm">{group.surface}</h3>
                <ul className="mt-3 space-y-2">
                  {group.rows.map(([name, className, ratio, use]) => (
                    <li key={name} className={className}>
                      <span className="font-bold">{name}</span> {ratio}
                      <span className="block text-sm">{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pan-stripe mt-8" aria-hidden="true" />
        </div>
      </section>

      <section aria-labelledby="type-heading" className="section border-line border-t">
        <div className="container-site space-y-4">
          <h2 id="type-heading" className="text-display-md">
            Type
          </h2>
          <p className="font-display text-display-xl">Display XL</p>
          <p className="font-display text-display-lg">Display LG</p>
          <p className="font-display text-display-md">Display MD</p>
          <p className="font-display text-display-sm">Display SM</p>
          <p className="eyebrow text-accent">Eyebrow label</p>
          <p className="max-w-prose">
            Body text is Lato at 17px with generous line height. Headings are Abril Fatface. Those
            are the only two typefaces.
          </p>
        </div>
      </section>

      <section aria-labelledby="buttons-heading" className="section border-line border-t">
        <div className="container-site">
          <h2 id="buttons-heading" className="text-display-md">
            Buttons
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="card flex flex-wrap gap-3 p-5">
              <a href="#buttons-heading" className="btn-outline">
                Outline
              </a>
            </div>
            <div className="card dark-section flex flex-wrap gap-3 p-5">
              <a href="#buttons-heading" className="btn-primary">
                Primary
              </a>
              <a href="#buttons-heading" className="btn-outline">
                Outline
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="quote-heading" className="section border-line border-t">
        <div className="container-site">
          <h2 id="quote-heading" className="text-display-md">
            Quote
          </h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="card dark-section p-6">
              <Quote
                text="A large quote, for its own band on a page."
                attribution="Who said it"
                size="lg"
              />
            </div>
            <div className="card red-section p-6">
              <Quote text="A smaller quote, inside a section." attribution="Who said it" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="components-heading" className="section border-line border-t">
        <div className="container-site">
          <h2 id="components-heading" className="text-display-md">
            Event card
          </h2>
          <div className="mt-5">
            <EventCard event={SAMPLE_EVENT} />
          </div>
        </div>
      </section>
    </>
  )
}
