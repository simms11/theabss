import { placeQuery } from '@/lib/maps'
import { formatPounds, lowestWeeklyFee } from '@/lib/payments'
import type { SiteSetting } from '@/payload-types'

export type KeyFact = { label: string; value: string; href?: string; linkText?: string }

/**
 * What a parent looks for first: when, who, what, where and what it costs. Built in one
 * place from Site Settings, for the home page's strip and the card beside every text page.
 * The price comes from the fees table, so it can't disagree with the Fees page.
 */
export const keyFacts = (settings: SiteSetting): KeyFact[] => {
  const { school } = settings
  const lowestFee = lowestWeeklyFee(settings.payments?.fees?.rows)
  const facts: Array<Omit<KeyFact, 'value'> & { value?: string | null }> = [
    { label: 'When', value: school?.sessions },
    { label: 'Who', value: school?.ages },
    { label: 'What', value: school?.subjects },
    { label: 'Where', value: placeQuery(school?.venue, school?.address ?? '') },
    {
      label: 'Cost',
      value: lowestFee === null ? null : `From ${formatPounds(lowestFee)} a week`,
      href: '/payment',
      linkText: 'See all fees',
    },
  ]
  return facts.filter((fact): fact is KeyFact => Boolean(fact.value))
}
