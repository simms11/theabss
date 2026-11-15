/**
 * Cloudflare Turnstile: a check that the sender is a person, without a puzzle. Optional.
 * With both keys set the form shows the widget and the server verifies its token; with
 * neither, the form relies on the hidden field alone (fine locally and in tests).
 */
export const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com'
export const TURNSTILE_FIELD = 'cf-turnstile-response'

type Env = Record<string, string | undefined>

export const turnstileSiteKey = (env: Env = process.env): string | null =>
  env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY
    ? env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    : null

export const verifyTurnstile = async (
  token: unknown,
  env: Env = process.env,
  fetcher: typeof fetch = fetch,
): Promise<boolean> => {
  if (!turnstileSiteKey(env)) return true
  if (typeof token !== 'string' || !token) return false
  try {
    const response = await fetcher(`${TURNSTILE_ORIGIN}/turnstile/v0/siteverify`, {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY as string, response: token }),
    })
    return ((await response.json()) as { success?: boolean }).success === true
  } catch {
    // If Cloudflare can't be reached, refuse: the parent sees a "try again" message.
    return false
  }
}
