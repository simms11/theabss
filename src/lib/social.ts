import type { SiteSetting } from '@/payload-types'

const LABELS = {
  instagram: 'Instagram',
  x: 'X (Twitter)',
  youtube: 'YouTube',
  facebook: 'Facebook',
} as const

export type SocialNetwork = keyof typeof LABELS
export type SocialLink = { network: SocialNetwork; label: string; href: string }

/** The school's social accounts that have an address set, in a fixed order. */
export const socialLinksFrom = (social: SiteSetting['social']): SocialLink[] =>
  (Object.keys(LABELS) as Array<keyof typeof LABELS>).flatMap((key) =>
    social?.[key] ? [{ network: key, label: LABELS[key], href: social[key] as string }] : [],
  )
