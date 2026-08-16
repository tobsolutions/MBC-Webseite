import { requireUser } from "@/lib/session"
import { getInternalEvents } from "@/lib/queries"
import { EventCalendar } from "@/components/event-calendar"

export const metadata = {
  title: "Termine – Mitgliederbereich | MBC Bellenberg e.V.",
}

export default async function InternEventsPage() {
  const user = await requireUser("/intern/termine")
  const events = await getInternalEvents(user.role)

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt ? e.endAt.toISOString() : null,
    allDay: e.allDay,
    visibility: e.visibility,
  }))

  return (
    <div>
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Kalender</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Interne Termine</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Vereinsabende, Arbeitseinsätze und interne Veranstaltungen – inklusive der öffentlichen Termine.
        </p>
      </header>

      <div className="mt-8">
        <EventCalendar events={calendarEvents} showLegend />
      </div>
    </div>
  )
}
