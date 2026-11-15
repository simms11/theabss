import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { LocationMap } from '@/components/LocationMap'
import { SocialLinks } from '@/components/SocialLinks'
import { ENQUIRY_RETENTION_MONTHS } from '@/lib/enquiry'
import { getPageContent, getSiteSettings } from '@/lib/queries'
import { socialLinksFrom } from '@/lib/social'
import { turnstileSiteKey } from '@/lib/turnstile'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Ask about a place for your child, or anything else, at the Afruika Bantu Saturday School.',
}

export default async function ContactPage() {
  const [settings, content] = await Promise.all([getSiteSettings(), getPageContent()])
  const { school, contactEmail, phone } = settings
  const socialLinks = socialLinksFrom(settings.social)

  return (
    <>
      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">Contact</h1>
          {content.intros?.contact && (
            <p className="text-fg-muted mt-3 max-w-2xl text-lg">{content.intros.contact}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container-site grid gap-x-16 gap-y-12 lg:grid-cols-2">
          <div>
            <h2 className="text-display-md">Send us a message</h2>
            <div className="mt-6">
              <ContactForm
                turnstileSiteKey={turnstileSiteKey()}
                retentionMonths={ENQUIRY_RETENTION_MONTHS}
              />
            </div>
          </div>

          <aside aria-labelledby="visit-heading" className="space-y-10">
            {school?.address && (
              <div>
                <h2 id="visit-heading" className="text-display-md">
                  Visit us
                </h2>
                {school.sessions && <p className="mt-2 font-bold">{school.sessions}</p>}
                <div className="mt-5">
                  <LocationMap
                    venue={school.venue}
                    address={school.address}
                    travel={school.travel}
                    layout="stacked"
                  />
                </div>
              </div>
            )}

            {(contactEmail || phone || socialLinks.length > 0) && (
              <div>
                <h2 className="text-display-md">Other ways to reach us</h2>
                <dl className="mt-4 space-y-3">
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
                  {socialLinks.length > 0 && (
                    <div>
                      <dt className="eyebrow text-accent">Follow us</dt>
                      <dd>
                        <SocialLinks links={socialLinks} className="mt-1" />
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  )
}
