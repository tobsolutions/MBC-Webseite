import Link from "next/link"
import { CalendarDays, FolderOpen, MapPin, ArrowRight, FileDown } from "lucide-react"
import { requireUser } from "@/lib/session"
import { getInternalUpcomingEvents, getInternalDocuments } from "@/lib/queries"
import { formatEventWhen, formatDate } from "@/lib/format"

export const metadata = {
  title: "Übersicht – Mitgliederbereich | MBC Bellenberg e.V.",
}

export default async function InternDashboard() {
  const user = await requireUser("/intern")
  const [events, documents] = await Promise.all([
    getInternalUpcomingEvents(user.role, 5),
    getInternalDocuments(user.role),
  ])
  const recentDocs = documents.slice(0, 5)

  return (
    <div>
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Willkommen zurück</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Hallo {user.name.split(" ")[0]}!</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Hier finden Sie interne Termine, Dokumente und Informationen für Vereinsmitglieder.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
              <CalendarDays className="size-5 text-accent" /> Nächste Termine
            </h2>
            <Link href="/intern/termine" className="text-sm text-accent hover:underline">
              Alle
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border border-t border-border">
            {events.length === 0 ? (
              <p className="py-5 text-sm text-muted-foreground">Keine anstehenden Termine.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="py-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{ev.title}</h3>
                    {ev.visibility !== "public" && (
                      <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                        Intern
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {formatEventWhen(ev.startAt, ev.endAt, ev.allDay)}
                  </p>
                  {ev.location && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" /> {ev.location}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
              <FolderOpen className="size-5 text-accent" /> Neueste Dokumente
            </h2>
            <Link href="/intern/dokumente" className="text-sm text-accent hover:underline">
              Alle
            </Link>
          </div>
          <div className="mt-4 divide-y divide-border border-t border-border">
            {recentDocs.length === 0 ? (
              <p className="py-5 text-sm text-muted-foreground">Keine Dokumente vorhanden.</p>
            ) : (
              recentDocs.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-medium group-hover:text-accent">{doc.title}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
                  </div>
                  <FileDown className="size-4 shrink-0 text-muted-foreground group-hover:text-accent" />
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
