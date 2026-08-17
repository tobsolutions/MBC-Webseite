import "server-only"
import ical, { type VEvent, type CalendarResponse } from "node-ical"

// Ein einzelner (ggf. aus einer Serie expandierter) Outlook-Termin.
export type OutlookEvent = {
  id: string
  title: string
  description: string
  location: string | null
  startAt: string // ISO
  endAt: string | null
  allDay: boolean
  visibility: "outlook"
}

export type OutlookResult = { ok: true; events: OutlookEvent[] } | { ok: false; error: string }

function cleanText(input: unknown): string {
  if (!input) return ""
  let value: unknown = input
  if (typeof value === "object" && value !== null && "val" in value) {
    value = (value as { val: unknown }).val
  }
  return String(value)
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .trim()
}

function isAllDay(ev: VEvent): boolean {
  const start = ev.start as Date & { dateOnly?: boolean }
  return Boolean(start?.dateOnly) || (ev as unknown as { datetype?: string }).datetype === "date"
}

/**
 * Laedt einen veroeffentlichten Outlook-/ICS-Kalender, parst ihn und expandiert
 * wiederkehrende Termine in ein Zeitfenster. Ergebnis wird ueber den Next.js
 * Data Cache 15 Minuten zwischengespeichert und dann automatisch erneuert.
 */
export async function fetchOutlookEvents(url: string): Promise<OutlookResult> {
  const raw = (url ?? "").trim()
  if (!raw) return { ok: false, error: "Keine Kalender-URL hinterlegt." }

  // webcal:// auf https:// normalisieren (Outlook liefert teils webcal-Links)
  let normalized = raw
  if (normalized.startsWith("webcal://")) normalized = "https://" + normalized.slice("webcal://".length)

  let text: string
  try {
    const res = await fetch(normalized, {
      next: { revalidate: 900 },
      headers: { "User-Agent": "MBC-Bellenberg-Website" },
    })
    if (!res.ok) return { ok: false, error: `Kalender nicht erreichbar (HTTP ${res.status}).` }
    text = await res.text()
  } catch {
    return { ok: false, error: "Kalender konnte nicht geladen werden. Bitte URL prüfen." }
  }

  if (!text.includes("BEGIN:VCALENDAR")) {
    return { ok: false, error: "Die URL liefert keinen gültigen ICS-Kalender." }
  }

  let data: CalendarResponse
  try {
    data = ical.sync.parseICS(text)
  } catch {
    return { ok: false, error: "Kalenderdaten konnten nicht gelesen werden." }
  }

  // Anzeigefenster: 2 Monate zurueck bis 18 Monate voraus.
  const now = new Date()
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 18, 0)

  const out: OutlookEvent[] = []
  const push = (ev: VEvent, start: Date, end: Date | null) => {
    out.push({
      id: `${ev.uid ?? "evt"}-${start.getTime()}`,
      title: cleanText(ev.summary) || "Termin",
      description: cleanText(ev.description),
      location: ev.location ? cleanText(ev.location) : null,
      startAt: start.toISOString(),
      endAt: end ? end.toISOString() : null,
      allDay: isAllDay(ev),
      visibility: "outlook",
    })
  }

  for (const key of Object.keys(data)) {
    const comp = data[key]
    if (!comp || comp.type !== "VEVENT") continue
    const ev = comp as VEvent
    const start = ev.start as Date | undefined
    if (!start) continue
    const end = (ev.end as Date | undefined) ?? null
    const durationMs = end ? end.getTime() - start.getTime() : 0

    // Einfacher (nicht wiederkehrender) Termin
    if (!ev.rrule) {
      if (start >= rangeStart && start <= rangeEnd) push(ev, start, end)
      continue
    }

    // Wiederkehrende Termine im Fenster expandieren
    const occurrences = ev.rrule.between(rangeStart, rangeEnd, true)
    for (const occ of occurrences) {
      const lookupKey = occ.toISOString().substring(0, 10)

      // Ausnahmetermin (EXDATE) -> ueberspringen
      const exdate = (ev as unknown as { exdate?: Record<string, unknown> }).exdate
      if (exdate && exdate[lookupKey]) continue

      // Einzeln geaenderter Termin der Serie (Override)
      const recurrences = (ev as unknown as { recurrences?: Record<string, VEvent> }).recurrences
      const override = recurrences?.[lookupKey]
      if (override && override.start) {
        const ovEnd = override.end ? (override.end as Date) : null
        push(override, override.start as Date, ovEnd)
        continue
      }

      const occEnd = durationMs ? new Date(occ.getTime() + durationMs) : null
      push(ev, occ, occEnd)
    }
  }

  out.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  return { ok: true, events: out }
}
