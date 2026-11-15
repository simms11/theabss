import type { SiteSetting } from '@/payload-types'

const LABELS = {
  instagram: 'Instagram',
  x: 'X (Twitter)',
  youtube: 'YouTube',
  facebook: 'Facebook',
} as const

/** The school's social accounts that have an address set, in a fixed order. */
export const socialLinksFrom = (
  social: SiteSetting['social'],
): Array<{ label: string; href: string }> =>
  (Object.keys(LABELS) as Array<keyof typeof LABELS>).flatMap((key) =>
    social?.[key] ? [{ label: LABELS[key], href: social[key] as string }] : [],
  )
