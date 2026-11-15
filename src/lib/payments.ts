/**
 * Paying the school: online from a bank account through GoCardless, or by bank transfer.
 *
 * Online payments use GoCardless payment links ("Pay by Bank"). The school creates a link in
 * its GoCardless dashboard (for term fees, a trip, a donation) and pastes it into Site
 * Settings; the site shows it as a button. One press takes a parent to GoCardless, where
 * they pick their bank and approve the payment in their banking app, with the amount and
 * payee already filled in. A Direct Debit link, for fees collected automatically, works the
 * same way. Nothing is typed on this site, so it holds no payment data and needs no keys
 * or scripts.
 */
const PAYMENT_LINK_HOSTS = new Set(['pay.gocardless.com'])

/** Only GoCardless's own payment pages may be linked: a typo or look-alike is refused. */
export const isPaymentLink = (value: unknown): boolean => {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value.trim())
    return (
      url.protocol === 'https:' && PAYMENT_LINK_HOSTS.has(url.hostname) && url.pathname.length > 1
    )
  } catch {
    return false
  }
}

type FeeRow = { notWorking?: number | null; partTime?: number | null; fullTime?: number | null }

/** £13, or £13.50 when there are pence. */
export const formatPounds = (amount: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)

/** The lowest weekly fee in the table, for "From £13 a week". Null when there are no fees. */
export const lowestWeeklyFee = (rows: FeeRow[] | null | undefined): number | null => {
  const amounts = (rows ?? [])
    .flatMap((row) => [row.notWorking, row.partTime, row.fullTime])
    .filter((amount): amount is number => typeof amount === 'number' && amount > 0)
  return amounts.length ? Math.min(...amounts) : null
}

/** "401234" or "40 12 34" → "40-12-34". Anything that isn't six digits is shown as typed. */
export const formatSortCode = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  return digits.length === 6 ? digits.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3') : value.trim()
}
