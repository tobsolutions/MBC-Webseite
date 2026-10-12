export const APP_TIME_ZONE = "Europe/Berlin"

const partsFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

function berlinParts(date: Date) {
  const p: Record<string, number> = {}
  for (const part of partsFmt.formatToParts(date)) {
    if (part.type !== "literal") p[part.type] = Number(part.value)
  }
  return p as { year: number; month: number; day: number; hour: number; minute: number; second: number }
}

function berlinOffsetMs(date: Date) {
  const p = berlinParts(date)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - Math.floor(date.getTime() / 1000) * 1000
}

/**
 * Interprets a "YYYY-MM-DDTHH:mm" (or "YYYY-MM-DD") value from a datetime-local
 * input as German local time, independent of the server's TZ setting.
 */
export function parseBerlinLocal(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (!m) return null
  const [, y, mo, d, h = "0", mi = "0"] = m
  const wallAsUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi))
  // Two passes handle the DST transition correctly.
  let ts = wallAsUtc - berlinOffsetMs(new Date(wallAsUtc))
  ts = wallAsUtc - berlinOffsetMs(new Date(ts))
  return new Date(ts)
}

/** Formats a date as "YYYY-MM-DDTHH:mm" in German local time for datetime-local inputs. */
export function toBerlinLocalInput(d: Date | string | null) {
  if (!d) return ""
  const p = berlinParts(new Date(d))
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}
