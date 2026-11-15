/**
 * Paying the school: by card through Stripe, or by bank transfer.
 *
 * Card payments use Stripe Payment Links. The school creates a link in its Stripe dashboard
 * (for term fees, a trip, a donation) and pastes it into Site Settings; the site shows it as
 * a button. Card details are typed on Stripe's own page, never on this site, so the site
 * holds no payment data and needs no Stripe keys or scripts.
 */
const STRIPE_HOSTS = new Set(['buy.stripe.com', 'donate.stripe.com'])

/** Only Stripe's own payment pages may be linked: a typo or a look-alike address is refused. */
export const isStripePaymentLink = (value: unknown): boolean => {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && STRIPE_HOSTS.has(url.hostname) && url.pathname.length > 1
  } catch {
    return false
  }
}

/** "401234" or "40 12 34" → "40-12-34". Anything that isn't six digits is shown as typed. */
export const formatSortCode = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  return digits.length === 6 ? digits.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3') : value.trim()
}
