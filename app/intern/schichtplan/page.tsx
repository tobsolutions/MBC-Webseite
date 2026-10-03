import { AlertCircle, CalendarClock } from "lucide-react"
import { requireUser } from "@/lib/session"
import { getSetting } from "@/lib/queries"
import { fetchOutlookEvents } from "@/lib/outlook-calendar"
import { OUTLOOK_CALENDAR_KEY, OUTLOOK_CALENDAR_START_KEY } from "@/lib/settings-keys"
import { OutlookAgenda } from "@/components/outlook-agenda"
import type { CalendarEvent } from "@/components/event-calendar"

export const metadata = {
  title: "Schichtplan Ausstellung – Mitgliederbereich | MBC Bellenberg e.V.",
}

export default async function SchichtplanPage() {
  await requireUser("/intern/schichtplan")

  const [outlookUrl, startDate] = await Promise.all([
    getSetting(OUTLOOK_CALENDAR_KEY),
    getSetting(OUTLOOK_CALENDAR_START_KEY),
  ])

  const outlook = outlookUrl ? await fetchOutlookEvents(outlookUrl, startDate) : null
  const events: CalendarEvent[] = outlook?.ok ? outlook.events : []

  return (
    <div>
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Ausstellung</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Schichtplan Ausstellung</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Die Termine aus dem freigegebenen Outlook-Kalender, tagesweise aufgelistet. Die Daten werden automatisch
          abgerufen und regelmäßig aktualisiert.
        </p>
      </header>

      <div className="mt-8">
        {!outlookUrl ? (
          <div className="flex items-center gap-2 rounded-sm border border-border bg-card p-6 text-sm text-muted-foreground">
            <CalendarClock className="size-4 shrink-0" />
            Es ist noch kein Outlook-Kalender hinterlegt. Ein Administrator kann diesen in den Einstellungen
            verbinden.
          </div>
        ) : outlook && !outlook.ok ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>Der Kalender konnte nicht geladen werden: {outlook.error}</span>
          </div>
        ) : (
          <OutlookAgenda events={events} />
        )}
      </div>
    </div>
  )
}
