import { getSetting } from "@/lib/queries"
import { fetchOutlookEvents } from "@/lib/outlook-calendar"
import { OUTLOOK_CALENDAR_KEY, OUTLOOK_CALENDAR_START_KEY } from "@/lib/settings-keys"
import { OutlookCalendarForm } from "@/components/admin/outlook-calendar-form"
import { Card } from "@/components/ui/card"

export const metadata = { title: "Einstellungen – Verwaltung | MBC Bellenberg" }

export default async function AdminSettings() {
  const [url, startDate] = await Promise.all([
    getSetting(OUTLOOK_CALENDAR_KEY),
    getSetting(OUTLOOK_CALENDAR_START_KEY),
  ])
  const calendarUrl = url ?? ""
  const calendarStart = startDate ?? ""

  let status: { ok: true; count: number } | { ok: false; error: string } | null = null
  if (calendarUrl) {
    const res = await fetchOutlookEvents(calendarUrl, calendarStart)
    status = res.ok ? { ok: true, count: res.events.length } : { ok: false, error: res.error }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Verwaltung</p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Externe Dienste und allgemeine Konfiguration der Website.
        </p>
      </header>

      <Card className="max-w-2xl p-6">
        <h2 className="font-serif text-xl font-bold">Outlook-Kalender</h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Binden Sie einen freigegebenen Outlook-/Microsoft-365-Kalender in den Mitgliederbereich ein. Die Termine
          werden automatisch abgerufen und rund alle 15 Minuten aktualisiert.
        </p>
        <div className="mt-6">
          <OutlookCalendarForm currentUrl={calendarUrl} currentStartDate={calendarStart} status={status} />
        </div>
      </Card>

      <Card className="max-w-2xl p-6">
        <h2 className="font-serif text-lg font-bold">So finden Sie den Link</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Outlook im Web öffnen und oben rechts auf das Zahnrad (Einstellungen) klicken.</li>
          <li>
            Zu <strong>Kalender → Freigegebene Kalender</strong> wechseln.
          </li>
          <li>
            Unter <strong>Kalender veröffentlichen</strong> den gewünschten Kalender auswählen und eine Berechtigung
            festlegen (z. B. „Alle Details anzeigen").
          </li>
          <li>
            Auf <strong>Veröffentlichen</strong> klicken und den <strong>ICS</strong>-Link kopieren (endet auf
            <code className="mx-1 rounded bg-secondary px-1 py-0.5 text-xs">.ics</code>).
          </li>
          <li>Den Link oben einfügen und speichern.</li>
        </ol>
      </Card>
    </div>
  )
}
