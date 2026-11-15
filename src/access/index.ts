import type { Access, AccessArgs, FieldAccess, Where } from 'payload'

import type { User } from '@/payload-types'

export type Role = 'admin' | 'editor'

export const isAdmin = (user: User | null | undefined): boolean => user?.role === 'admin'

/** Anyone, signed in or not. */
export const anyone: Access = () => true

/** Nobody through the API. Used where only server code (the Local API) may write. */
export const nobody: Access = () => false

/** Any signed-in user (admin or editor). */
export const authenticated: Access = ({ req: { user } }: AccessArgs<User>) => Boolean(user)

/** Admins only. */
export const admins: Access = ({ req: { user } }: AccessArgs<User>) => isAdmin(user)

/** Admins only, for individual fields (e.g. role). */
export const adminsField: FieldAccess = ({ req: { user } }) => isAdmin(user as User)

/**
 * Admins can do anything; other users are limited to their own document.
 * Used on Users so an editor can change their own name and password but not other accounts.
 */
export const adminsOrSelf: Access = ({ req: { user } }: AccessArgs<User>) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { id: { equals: user.id } }
}

/**
 * Site content (events, pages). The public sees published documents only; anyone signed in
 * also sees drafts, because admins and editors both prepare content.
 */
export const authenticatedOrPublished: Access = ({ req: { user } }: AccessArgs<User>) => {
  if (user) return true
  const published: Where = { _status: { equals: 'published' } }
  return published
}
