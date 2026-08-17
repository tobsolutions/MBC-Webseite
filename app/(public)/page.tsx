import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, MapPin, Wrench, Users, Train } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPublishedNews, getUpcomingPublicEvents } from "@/lib/queries"
import { formatDate, formatEventWhen } from "@/lib/format"

export default async function HomePage() {
  const [news, events] = await Promise.all([getPublishedNews(3), getUpcomingPublicEvents(4)])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-werkstatt.png"
            alt="Detaillierte Modellbahn-Landschaft im Vereinsheim"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            Seit 1985 · Bellenberg
          </p>
          <h1 className="mt-4 max-w-3xl text-balance font-serif text-4xl font-bold leading-tight md:text-6xl">
            Modellbau, der Menschen verbindet.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
            Der Modellbauclub Bellenberg e.V. ist ein Verein für technisch Interessierte, handwerklich
            Geschickte und kreative Köpfe. Ob Modellbahn, Flugmodell oder Diorama – bei uns wird gebaut,
            gefachsimpelt und gemeinsam Freude am Detail gelebt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/kontakt">
                Mitglied werden <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link href="/galerie">Galerie ansehen</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Kurzvorstellung / Bereiche */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Train,
              title: "Modellbahn & Anlagen",
              text: "Vom Gleisplan bis zur fertigen Landschaft – wir bauen Anlagen in verschiedenen Spurweiten mit Liebe zum Detail.",
            },
            {
              icon: Wrench,
              title: "Werkstatt & Technik",
              text: "In unserer Vereinswerkstatt stehen Werkzeuge, Erfahrung und helfende Hände bereit – für Einsteiger und Profis.",
            },
            {
              icon: Users,
              title: "Gemeinschaft",
              text: "Regelmäßige Treffen, Ausstellungen und Ausflüge. Bei uns zählt das Miteinander genauso wie das Modell.",
            },
          ].map((item) => (
            <div key={item.title} className="border-t-2 border-accent pt-6">
              <item.icon className="size-7 text-accent" />
              <h2 className="mt-4 font-serif text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Aktuelles */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Neuigkeiten</p>
              <h2 className="mt-2 font-serif text-3xl font-bold">Aktuelles aus dem Verein</h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/seite/verein#aktuelles">
                Alle Beiträge <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {news.length === 0 ? (
            <p className="mt-10 text-muted-foreground">Zurzeit sind keine Neuigkeiten veröffentlicht.</p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {news.map((item) => (
                <Link
                  key={item.id}
                  href={`/aktuelles/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-colors hover:border-accent"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={item.image || "/images/modellbahn.png"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <time className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {formatDate(item.publishedAt)}
                    </time>
                    <h3 className="mt-2 font-serif text-lg font-bold leading-snug">{item.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {item.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Termine */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Kalender</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Nächste Termine</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Vereinsabende, Ausstellungen und öffentliche Veranstaltungen. Schauen Sie vorbei – Gäste
              sind herzlich willkommen.
            </p>
            <Button asChild variant="outline" className="mt-6 bg-transparent">
              <Link href="/termine">
                Zum vollständigen Kalender <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-border border-t border-border">
            {events.length === 0 ? (
              <p className="py-6 text-muted-foreground">Aktuell sind keine öffentlichen Termine geplant.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="flex gap-4 py-5">
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-sm bg-primary text-primary-foreground">
                    <span className="font-serif text-lg font-bold leading-none">
                      {new Date(ev.startAt).getDate()}
                    </span>
                    <span className="mt-0.5 font-mono text-[10px] uppercase tracking-widest">
                      {new Intl.DateTimeFormat("de-DE", { month: "short" }).format(new Date(ev.startAt))}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-bold leading-snug">{ev.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {formatEventWhen(ev.startAt, ev.endAt, ev.allDay)}
                    </p>
                    {ev.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" /> {ev.location}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  )
}
