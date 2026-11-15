import type { Metadata } from 'next'
import Link from 'next/link'

import { formatPounds, formatSortCode, isStripePaymentLink, lowestWeeklyFee } from '@/lib/payments'
import { getSiteSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Fees and payment',
  description:
    'What the Afruika Bantu Saturday School costs, and how to pay fees or donate by card or bank transfer.',
}

/**
 * Fees and payment, in the order a parent asks: what does it cost, what are the terms, how
 * do I pay. The headline figures come first; the full table follows for those who need it.
 */
export default async function PaymentPage() {
  const { payments } = await getSiteSettings()
  const fees = payments?.fees
  const rows = fees?.rows ?? []
  const lowest = lowestWeeklyFee(rows)

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
  const canPayOnline = links.length > 0 || hasBank

  const headlines = [
    lowest !== null && { label: 'Weekly fee', value: `From ${formatPounds(lowest)}` },
    typeof fees?.adminFee === 'number' &&
      fees.adminFee > 0 && {
        label: 'One-off admin fee',
        value: formatPounds(fees.adminFee),
        note: 'Paid once, when you join',
      },
    fees?.schedule && { label: 'Pay', value: fees.schedule },
  ].filter(Boolean) as Array<{ label: string; value: string; note?: string }>

  return (
    <>
      <section className="dark-section">
        <div className="container-site py-14">
          <h1 className="text-display-lg">Fees and payment</h1>
          {payments?.intro && (
            <p className="text-fg-muted mt-3 max-w-2xl text-lg">{payments.intro}</p>
          )}
          {headlines.length > 0 && (
            <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-3">
              {headlines.map((item) => (
                <div key={item.label} className="border-accent border-l-4 pl-4">
                  <dt className="eyebrow text-accent">{item.label}</dt>
                  <dd className="font-display text-display-sm mt-1">{item.value}</dd>
                  {item.note && <dd className="text-fg-muted text-sm">{item.note}</dd>}
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {rows.length > 0 && (
        <section aria-labelledby="fees-heading" className="section">
          <div className="container-site">
            <h2 id="fees-heading" className="text-display-md">
              Weekly fees
            </h2>
            <p className="text-fg-muted mt-2 max-w-2xl">
              Find the row for the number of children attending and the column for your work
              situation.
            </p>
            {/* Scrolls sideways inside its own box on a very narrow screen, never the page. */}
            <div
              className="mt-6 max-w-3xl overflow-x-auto"
              tabIndex={0}
              role="region"
              aria-labelledby="fees-heading"
            >
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-ink border-b-2">
                    <th scope="col" className="py-3 pr-4 font-bold">
                      Children
                    </th>
                    {[
                      'Parent not working',
                      'Parent working part time',
                      'Parent working full time',
                    ].map((heading) => (
                      <th key={heading} scope="col" className="px-3 py-3 text-right font-bold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id ?? row.children} className="border-line border-b">
                      <th scope="row" className="py-3 pr-4 font-bold whitespace-nowrap">
                        {row.children}
                      </th>
                      {[row.notWorking, row.partTime, row.fullTime].map((amount, index) => (
                        <td key={index} className="px-3 py-3 text-right tabular-nums">
                          {typeof amount === 'number' ? formatPounds(amount) : '–'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fees?.notes && (
              <div className="card border-l-gold mt-8 max-w-3xl border-l-4 p-5">
                <h3 className="text-display-sm">Good to know</h3>
                <p className="mt-2 whitespace-pre-line">{fees.notes}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="pay-heading" className="section border-line border-t">
        <div className="container-site">
          <h2 id="pay-heading" className="text-display-md">
            How to pay
          </h2>

          {canPayOnline ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {links.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-display-sm">By card</h3>
                  <p className="text-fg-muted mt-2">
                    Card payments are taken by Stripe on its own secure page. We never see or store
                    your card details.
                  </p>
                  <ul className="mt-5 space-y-5">
                    {links.map((link) => (
                      <li key={link.id ?? link.url}>
                        <p className="font-bold">{link.label}</p>
                        {link.description && <p className="text-fg-muted">{link.description}</p>}
                        <a href={link.url} rel="noopener noreferrer" className="btn-solid mt-2">
                          Pay by card
                          <span className="sr-only"> for {link.label} (opens Stripe)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasBank && (
                <div className="card p-6">
                  <h3 className="text-display-sm">By bank transfer</h3>
                  <dl className="mt-3 divide-y divide-(--color-line)">
                    {bankRows.map((row) => (
                      <div key={row.label} className="flex flex-wrap justify-between gap-x-6 py-3">
                        <dt className="text-fg-muted">{row.label}</dt>
                        <dd className="font-bold select-all">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-3 max-w-prose">
              Payment details will be listed here. Until then, please ask us how to pay fees or make
              a donation.
            </p>
          )}

          <p className="mt-8">
            <Link href="/contact" className={canPayOnline ? 'btn-outline' : 'btn-solid'}>
              {canPayOnline ? 'Ask a question about fees' : 'Contact us'}
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
