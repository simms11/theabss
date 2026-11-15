/**
 * Event dates. The school is in London, so every date is shown in London time whatever the
 * server's or the visitor's clock says (Vercel's servers run on UTC).
 */
const TIME_ZONE = 'Europe/London'

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TIME_ZONE,
})

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: TIME_ZONE,
})

const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }) // YYYY-MM-DD

/**
 * "Saturday 12 July 2025". Built from parts: whether a comma follows the weekday depends on
 * the Node version's locale data, and the page must read the same everywhere.
 */
export const formatDay = (iso: string): string => {
  const parts = Object.fromEntries(
    dayFormat.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  )
  return `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`
}

/** "10:30am" */
export const formatTime = (iso: string): string =>
  timeFormat.format(new Date(iso)).replace(/\s/g, '').toLowerCase()

/** "Saturday 12 July 2025, 10:30am to 5pm", or with both days when it spans more than one. */
export const formatEventWhen = (start: string, end?: string | null): string => {
  const short = (iso: string) => formatTime(iso).replace(':00', '')
  if (!end) return `${formatDay(start)}, ${short(start)}`
  return dayKey.format(new Date(start)) === dayKey.format(new Date(end))
    ? `${formatDay(start)}, ${short(start)} to ${short(end)}`
    : `${formatDay(start)}, ${short(start)} to ${formatDay(end)}, ${short(end)}`
}

/** The first instant of the London day after `date`, as a UTC Date. */
const endOfLondonDay = (date: Date): Date => {
  const [y, m, d] = dayKey.format(date).split('-').map(Number)
  // Midnight UTC of the next day, shifted by London's offset at that moment (0 or 1 hour).
  const guess = new Date(Date.UTC(y, m - 1, d + 1))
  const londonHour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: TIME_ZONE })
      .format(guess)
      .replace(/\D/g, ''),
  )
  return new Date(guess.getTime() - (londonHour % 24) * 60 * 60 * 1000)
}

/**
 * When an event stops being "upcoming": its end time, or the end of its London day when no
 * end was given. So an event stays listed while it is happening and drops off afterwards.
 */
export const eventFinishesAt = (start: string, end?: string | null): Date =>
  end ? new Date(end) : endOfLondonDay(new Date(start))

export const isUpcoming = (
  event: { start: string; end?: string | null },
  now: Date = new Date(),
): boolean => eventFinishesAt(event.start, event.end).getTime() > now.getTime()
