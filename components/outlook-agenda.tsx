"use client"

import { useMemo, useState } from "react"
import { MapPin, CalendarClock, Search, X } from "lucide-react"
import type { CalendarEvent } from "@/components/event-calendar"

type ParsedEvent = CalendarEvent & { start: Date; end: Date | null }

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function timeLabel(e: ParsedEvent) {
  if (e.allDay) return "Ganztägig"
  const start = e.start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  if (e.end) {
    const end = e.end.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    return `${start} – ${end} Uhr`
  }
  return `${start} Uhr`
}

// Sortierschluessel fuer Uhrzeit-Gruppen innerhalb eines Tages.
function timeSortKey(e: ParsedEvent) {
  if (e.allDay) return -1
  return e.start.getHours() * 60 + e.start.getMinutes()
}

// Termine mit "Schichtleiter" (in Titel oder Beschreibung) sollen zuerst erscheinen.
function isSchichtleiter(e: ParsedEvent) {
  const haystack = `${e.title} ${e.description ?? ""}`.toLowerCase()
  return haystack.includes("schichtleiter")
}

export function OutlookAgenda({ events, showDescription = true }: { events: CalendarEvent[]; showDescription?: boolean }) {
  const [query, setQuery] = useState("")

  // Nach Tag und dann nach identischer Uhrzeit gruppieren.
  const days = useMemo(() => {
    const q = query.trim().toLowerCase()
    const parsed: ParsedEvent[] = events
      .map((e) => ({ ...e, start: new Date(e.startAt), end: e.endAt ? new Date(e.endAt) : null }))
      // Textfilter: nur Termine, die den Suchtext in Titel, Beschreibung oder Ort enthalten.
      .filter((e) => {
        if (!q) return true
        const haystack = `${e.title} ${e.description ?? ""} ${e.location ?? ""}`.toLowerCase()
        return haystack.includes(q)
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime())

    const byDay = new Map<string, ParsedEvent[]>()
    for (const e of parsed) {
      const key = dayKey(e.start)
      const list = byDay.get(key)
      if (list) list.push(e)
      else byDay.set(key, [e])
    }

    return Array.from(byDay.values()).map((dayEvents) => {
      // Innerhalb eines Tages: Termine mit gleicher Uhrzeit zusammenfassen.
      const byTime = new Map<string, ParsedEvent[]>()
      for (const e of dayEvents) {
        const key = timeLabel(e)
        const list = byTime.get(key)
        if (list) list.push(e)
        else byTime.set(key, [e])
      }
      const groups = Array.from(byTime.entries())
        .map(([label, list]) => ({
          label,
          // Ganztägige Termine stehen zuerst, danach die Startuhrzeit. Schichtleiter bleibt innerhalb einer Uhrzeit vorn.
          list: [...list].sort((a, b) => Number(isSchichtleiter(b)) - Number(isSchichtleiter(a))),
          isAllDay: list[0].allDay,
          priority: list[0].allDay ? 0 : 1,
          sort: timeSortKey(list[0]),
          leader: isSchichtleiter(list[0]) ? 0 : 1,
  }))
  .sort((a, b) => a.priority - b.priority || a.sort - b.sort || a.leader - b.leader)
      return { date: dayEvents[0].start, groups }
    })
  }, [events, query])

  const hasQuery = query.trim().length > 0

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Termine durchsuchen (z. B. Name, Schicht, Ort) …"
          aria-label="Termine nach Text filtern"
          className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Filter zurücksetzen"
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {days.length === 0 && (
        <div className="flex items-center gap-2 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
          <CalendarClock className="size-4 shrink-0" />
          {hasQuery
            ? `Keine Termine gefunden für „${query.trim()}".`
            : "Aktuell sind keine Termine vorhanden."}
        </div>
      )}

      {days.map((day) => (
        <section key={dayKey(day.date)} className="rounded-sm border border-border bg-card">
          <header className="border-b border-border bg-secondary/40 px-4 py-3">
            <h3 className="font-serif text-base font-bold">
              {day.date.toLocaleDateString("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
          </header>
          <div className="divide-y divide-border">
            {day.groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:gap-4">
                <div className="flex shrink-0 items-center gap-1.5 sm:w-40">
                  {!group.isAllDay && <CalendarClock className="size-3.5 text-accent" />}
                  {!group.isAllDay && (
                    <span className="font-mono text-xs font-medium uppercase tracking-wide text-accent">
                      {group.label}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {group.list.map((e) => (
                    <div key={e.id} className="min-w-0">
                      <p className="font-medium leading-snug">{e.title}</p>
                      {e.location && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" /> {e.location}
                        </p>
                      )}
                      {showDescription && e.description && (
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                          {e.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
