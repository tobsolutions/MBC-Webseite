import Link from "next/link"
import { ArrowRight, CalendarClock, CalendarDays, FileDown, FileText, MapPin } from "lucide-react"
import { requireHelperAccess } from "@/lib/helper-access"
import { getHelperDocuments, getHelperNavPages, getSetting } from "@/lib/queries"
import { fetchOutlookEvents } from "@/lib/outlook-calendar"
import { OUTLOOK_CALENDAR_KEY, OUTLOOK_CALENDAR_START_KEY } from "@/lib/settings-keys"
import { formatDate, formatFileSize } from "@/lib/format"

export const metadata = {
  title: "Helferbereich – Ausstellung | MBC Bellenberg e.V.",
}

const UPCOMING_LIMIT = 8

async function getUpcomingOutlookEvents() {
  const [url, startDate] = await Promise.all([
    getSetting(OUTLOOK_CALENDAR_KEY),
    getSetting(OUTLOOK_CALENDAR_START_KEY),
  ])
  if (!url) return []
  const result = await fetchOutlookEvents(url, startDate)
  if (!result.ok) return []
  const now = Date.now()
  return result.events
    .filter((ev) => new Date(ev.endAt ?? ev.startAt).getTime() >= now)
    .slice(0, UPCOMING_LIMIT)
    .map((ev) => ({ ...ev, startAt: new Date(ev.startAt) }))
}

export default async function HelperOverviewPage() {
  await requireHelperAccess()
  const [pages, events, documents] = await Promise.all([
    getHelperNavPages(),
    getUpcomingOutlookEvents(),
    getHelperDocuments(),
  ])

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Willkommen</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-balance">Helferbereich Ausstellung</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Hier finden Sie alle Informationen, Termine und den Schichtplan für die Ausstellung.
        </p>
      </header>

      <section aria-labelledby="helper-links" className="grid gap-3 sm:grid-cols-2">
        <h2 id="helper-links" className="sr-only">
          Bereiche
        </h2>
        <Link
          href="/helfer/schichtplan"
          className="group flex items-center gap-3 rounded-sm border border-border bg-card p-4 transition-colors hover:border-accent"
        >
          <CalendarClock className="size-5 shrink-0 text-accent" />
          <span className="flex-1 font-medium">Schichtplan Ausstellung</span>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
        {pages.map((p) => (
          <Link
            key={p.slug}
            href={`/helfer/seite/${p.slug}`}
            className="group flex items-center gap-3 rounded-sm border border-border bg-card p-4 transition-colors hover:border-accent"
          >
            <FileText className="size-5 shrink-0 text-accent" />
            <span className="flex-1 font-medium">{p.title}</span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </section>

      <section aria-labelledby="helper-events">
        <h2 id="helper-events" className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Anstehende Termine
        </h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aktuell sind keine Termine eingetragen.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-t border-border">
            {events.map((ev) => (
              <li key={ev.id} className="flex gap-4 py-4">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="font-mono text-xs text-accent">
                    {ev.startAt.toLocaleDateString("de-DE", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {!ev.allDay &&
                      ` · ${ev.startAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`}
                  </p>
                  <h3 className="mt-0.5 font-medium">{ev.title}</h3>
                  {ev.location && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" /> {ev.location}
                    </p>
                  )}
                  {ev.description && (
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{ev.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {documents.length > 0 && (
        <section aria-labelledby="helper-docs">
          <h2 id="helper-docs" className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Dokumente
          </h2>
          <div className="mt-3 divide-y divide-border border-t border-border">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 py-4"
              >
                <FileText className="size-5 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium group-hover:text-accent">{doc.title}</h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {doc.fileName}
                    {doc.fileSize ? ` · ${formatFileSize(doc.fileSize)}` : ""} · {formatDate(doc.createdAt)}
                  </p>
                </div>
                <FileDown className="size-4 shrink-0 text-muted-foreground group-hover:text-accent" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
