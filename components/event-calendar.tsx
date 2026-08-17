"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type CalendarEvent = {
  id: number | string
  title: string
  description: string
  location: string | null
  startAt: string
  endAt: string | null
  allDay: boolean
  visibility: string
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
]

const scopeStyles: Record<string, string> = {
  public: "bg-accent",
  mitglied: "bg-primary",
  ausstellungshelfer: "bg-chart-4",
  outlook: "bg-chart-3",
}

const scopeLabels: Record<string, string> = {
  public: "Öffentlich",
  mitglied: "Intern",
  ausstellungshelfer: "Ausstellung",
  outlook: "Outlook",
}

function sameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  )
}

export function EventCalendar({
  events,
  showLegend = false,
}: {
  events: CalendarEvent[]
  showLegend?: boolean
}) {
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState<Date | null>(null)

  const parsed = useMemo(
    () => events.map((e) => ({ ...e, start: new Date(e.startAt) })),
    [events],
  )

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
  // Monday-based offset
  const startWeekday = (monthStart.getDay() + 6) % 7
  const daysInMonth = monthEnd.getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
  while (cells.length % 7 !== 0) cells.push(null)

  const eventsForDay = (day: Date) => parsed.filter((e) => sameDay(e.start, day))

  const listEvents = selected
    ? eventsForDay(selected)
    : parsed
        .filter((e) => e.start >= monthStart && e.start <= new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate(), 23, 59))
        .sort((a, b) => a.start.getTime() - b.start.getTime())

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      {/* Calendar grid */}
      <div className="rounded-sm border border-border bg-card p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent"
              aria-label="Vorheriger Monat"
              onClick={() => {
                setSelected(null)
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
              }}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => {
                setSelected(null)
                setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
              }}
            >
              Heute
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent"
              aria-label="Nächster Monat"
              onClick={() => {
                setSelected(null)
                setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
              }}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {w}
            </div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />
            const dayEvents = eventsForDay(day)
            const isToday = sameDay(day, today)
            const isSelected = selected && sameDay(day, selected)
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(isSelected ? null : day)}
                className={cn(
                  "flex aspect-square flex-col items-center rounded-sm border p-1 text-sm transition-colors",
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-transparent hover:border-border hover:bg-secondary",
                  isToday && !isSelected && "border-border bg-secondary",
                )}
              >
                <span className={cn("font-medium", isToday && "text-accent")}>{day.getDate()}</span>
                <span className="mt-auto flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span key={e.id} className={cn("size-1.5 rounded-full", scopeStyles[e.visibility] ?? "bg-accent")} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>

        {showLegend && (
          <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4">
            {Object.entries(scopeLabels).map(([key, label]) => (
              <span key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("size-2 rounded-full", scopeStyles[key])} /> {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Event list */}
      <div>
        <h3 className="font-serif text-lg font-bold">
          {selected
            ? selected.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })
            : "Termine im Monat"}
        </h3>
        <div className="mt-4 space-y-3">
          {listEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selected ? "Keine Termine an diesem Tag." : "Keine Termine in diesem Monat."}
            </p>
          ) : (
            listEvents.map((e) => (
              <div key={e.id} className="rounded-sm border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-bold leading-snug">{e.title}</h4>
                  <Badge variant="secondary" className="shrink-0 font-mono text-[10px] uppercase">
                    {scopeLabels[e.visibility] ?? e.visibility}
                  </Badge>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {e.start.toLocaleDateString("de-DE", { day: "2-digit", month: "long" })}
                  {!e.allDay && ` · ${e.start.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`}
                  {e.allDay && " · ganztägig"}
                </p>
                {e.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {e.location}
                  </p>
                )}
                {e.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
