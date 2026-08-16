import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { EventCalendar, type CalendarEvent } from "@/components/event-calendar"
import { getPublicEvents } from "@/lib/queries"

export const metadata: Metadata = {
  title: "Termine · Modellbauclub Bellenberg e.V.",
}

export default async function TerminePage() {
  const events = await getPublicEvents()
  const calendarEvents: CalendarEvent[] = events.map((e) => ({
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
      <PageHero
        title="Terminkalender"
        eyebrow="Veranstaltungen"
        subtitle="Öffentliche Vereinsabende, Ausstellungen und Veranstaltungen. Gäste sind herzlich willkommen."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EventCalendar events={calendarEvents} />
      </div>
    </div>
  )
}
