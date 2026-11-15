import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { LocationMap } from '@/components/LocationMap'
import { ENQUIRY_RETENTION_MONTHS } from '@/lib/enquiry'
import { getSiteSettings } from '@/lib/queries'
import { turnstileSiteKey } from '@/lib/turnstile'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Ask about a place for your child, or anything else, at the Afruika Bantu Saturday School.',
}

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const { school, contactEmail, phone } = settings

  return (
    <>
      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">Contact</h1>
          <p className="text-fg-muted mt-3 max-w-2xl text-lg">
            Ask about a place for your child, volunteering, or anything else. We’ll reply by email.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-site grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div>
            <h2 className="text-display-md">Send us a message</h2>
            <div className="mt-6">
              <ContactForm
                turnstileSiteKey={turnstileSiteKey()}
                retentionMonths={ENQUIRY_RETENTION_MONTHS}
              />
            </div>
          </div>

          {(contactEmail || phone || school?.sessions) && (
            <aside aria-labelledby="other-ways-heading">
              <h2 id="other-ways-heading" className="text-display-md">
                Other ways to reach us
              </h2>
              <dl className="mt-6 space-y-4">
                {contactEmail && (
                  <div>
                    <dt className="eyebrow text-accent">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="inline-flex min-h-11 items-center font-bold"
                      >
                        {contactEmail}
                      </a>
                    </dd>
                  </div>
                )}
                {phone && (
                  <div>
                    <dt className="eyebrow text-accent">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex min-h-11 items-center font-bold"
                      >
                        {phone}
                      </a>
                    </dd>
                  </div>
                )}
                {school?.sessions && (
                  <div>
                    <dt className="eyebrow text-accent">In person</dt>
                    <dd className="mt-1 font-bold">{school.sessions}</dd>
                  </div>
                )}
              </dl>
            </aside>
          )}
        </div>
      </section>

      {school?.address && (
        <section aria-labelledby="find-us-heading" className="section border-line border-t">
          <div className="container-site">
            <h2 id="find-us-heading" className="text-display-md">
              Find us
            </h2>
            <div className="mt-8">
              <LocationMap venue={school.venue} address={school.address} />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
