import type { Metadata } from 'next'
import Link from 'next/link'

import { formatSortCode, isStripePaymentLink } from '@/lib/payments'
import { getSiteSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Payment',
  description: 'Pay fees or donate to the Afruika Bantu Saturday School by card or bank transfer.',
}

export default async function PaymentPage() {
  const { payments } = await getSiteSettings()
  // Checked again here, not only in the admin: a link is only ever rendered if it is Stripe's.
  const links = (payments?.links ?? []).filter((link) => isStripePaymentLink(link.url))
  const bank = payments?.bank
  const bankRows = [
    { label: 'Account name', value: bank?.accountName },
    { label: 'Bank', value: bank?.bankName },
    { label: 'Sort code', value: bank?.sortCode ? formatSortCode(bank.sortCode) : null },
    { label: 'Account number', value: bank?.accountNumber },
    { label: 'Reference', value: bank?.reference },
  ].filter((row) => row.value)
  const hasBank = Boolean(bank?.sortCode && bank?.accountNumber)

  return (
    <>
      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">Payment</h1>
          {payments?.intro && (
            <p className="text-fg-muted mt-3 max-w-2xl text-lg">{payments.intro}</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          {links.length > 0 && (
            <div>
              <h2 className="text-display-md">Pay by card</h2>
              <p className="text-fg-muted mt-2">
                Card payments are taken by Stripe on its own secure page. We never see or store your
                card details.
              </p>
              <ul className="mt-6 space-y-4">
                {links.map((link) => (
                  <li key={link.id ?? link.url} className="card p-5">
                    <h3 className="text-display-sm">{link.label}</h3>
                    {link.description && <p className="text-fg-muted mt-1">{link.description}</p>}
                    <a href={link.url} rel="noopener noreferrer" className="btn-solid mt-4">
                      Pay by card<span className="sr-only">: {link.label} (opens Stripe)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasBank && (
            <div>
              <h2 className="text-display-md">Pay by bank transfer</h2>
              <dl className="card mt-6 divide-y divide-(--color-line) p-5">
                {bankRows.map((row) => (
                  <div key={row.label} className="flex flex-wrap justify-between gap-x-6 py-3">
                    <dt className="text-fg-muted">{row.label}</dt>
                    <dd className="font-bold select-all">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {links.length === 0 && !hasBank && (
            <div>
              <h2 className="text-display-md">How to pay</h2>
              <p className="mt-3 max-w-prose">
                Payment details will be listed here. Until then, please ask us how to pay fees or
                make a donation.
              </p>
              <Link href="/contact" className="btn-solid mt-6">
                Contact us
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
