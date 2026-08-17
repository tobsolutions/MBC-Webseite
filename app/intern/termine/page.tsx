import { CalendarClock, AlertCircle } from "lucide-react"
import { requireUser } from "@/lib/session"
import { getInternalEvents, getSetting } from "@/lib/queries"
import { fetchOutlookEvents } from "@/lib/outlook-calendar"
import { OUTLOOK_CALENDAR_KEY } from "@/lib/settings-keys"
import { EventCalendar, type CalendarEvent } from "@/components/event-calendar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const metadata = {
  title: "Termine – Mitgliederbereich | MBC Bellenberg e.V.",
}

export default async function InternEventsPage() {
  const user = await requireUser("/intern/termine")

  const [events, outlookUrl] = await Promise.all([
    getInternalEvents(user.role),
    getSetting(OUTLOOK_CALENDAR_KEY),
  ])

  const calendarEvents: CalendarEvent[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt ? e.endAt.toISOString() : null,
    allDay: e.allDay,
    visibility: e.visibility,
    clubInternal: e.clubInternal,
  }))

  // Outlook-Kalender nur laden, wenn eine URL hinterlegt ist.
  const outlook = outlookUrl ? await fetchOutlookEvents(outlookUrl) : null
  const outlookEvents: CalendarEvent[] = outlook?.ok ? outlook.events : []
  const hasOutlook = Boolean(outlookUrl)

  return (
    <div>
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Kalender</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Termine</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Vereinsabende, Arbeitseinsätze und interne Veranstaltungen – inklusive der öffentlichen Termine.
        </p>
      </header>

      {hasOutlook ? (
        <Tabs defaultValue="intern" className="mt-8">
          <TabsList>
            <TabsTrigger value="intern">Interne Termine</TabsTrigger>
            <TabsTrigger value="outlook">
              <CalendarClock className="size-4" /> Outlook-Kalender
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intern" className="pt-6">
            <EventCalendar events={calendarEvents} showLegend />
          </TabsContent>

          <TabsContent value="outlook" className="pt-6">
            {outlook && !outlook.ok ? (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <span>Der Outlook-Kalender konnte nicht geladen werden: {outlook.error}</span>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground text-pretty">
                  Termine aus dem freigegebenen Outlook-Kalender. Die Daten werden automatisch abgerufen und regelmäßig
                  aktualisiert.
                </p>
                <EventCalendar events={outlookEvents} />
              </>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="mt-8">
          <EventCalendar events={calendarEvents} showLegend />
        </div>
      )}
    </div>
  )
}
