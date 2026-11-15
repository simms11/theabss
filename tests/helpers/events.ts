import type { APIRequestContext } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

/** Each test file signs in as its own admin, so files running side by side don't collide. */
const adminFor = (name: string) => ({
  email: `e2e-${name}@example.com`,
  password: `e2e-${name}-password`,
  name: `E2E ${name}`,
  role: 'admin' as const,
})

/**
 * Publishes events through the site's own API, signed in as an admin. Going through the
 * running site (not straight to the database) means its cache is refreshed, exactly as when
 * an editor publishes, so the pages show the events at once.
 */
export async function signIn(request: APIRequestContext, name = 'events'): Promise<string> {
  const editor = adminFor(name)
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: editor.email } } })
  await payload.create({ collection: 'users', data: editor })
  const response = await request.post('/api/users/login', {
    data: { email: editor.email, password: editor.password },
  })
  return ((await response.json()) as { token: string }).token
}

export async function publishEvent(
  request: APIRequestContext,
  token: string,
  event: Record<string, unknown>,
): Promise<void> {
  const response = await request.post('/api/events', {
    headers: { Authorization: `JWT ${token}` },
    data: { ...event, _status: 'published' },
  })
  if (!response.ok()) throw new Error(`Could not publish event: ${await response.text()}`)
}

export async function removeEvents(
  request: APIRequestContext,
  token: string,
  titlePrefix: string,
): Promise<void> {
  await request.delete(`/api/events?where[title][contains]=${encodeURIComponent(titlePrefix)}`, {
    headers: { Authorization: `JWT ${token}` },
  })
  await signOut()
}

export async function signOut(name = 'events'): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'users',
    where: { email: { equals: adminFor(name).email } },
  })
}
