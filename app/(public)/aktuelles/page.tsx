import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { getPublishedNews } from "@/lib/queries"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = {
  title: "Aktuelles · Modellbauclub Bellenberg e.V.",
}

export default async function AktuellesPage() {
  const news = await getPublishedNews()

  return (
    <div>
      <PageHero
        title="Aktuelles"
        eyebrow="Neuigkeiten"
        subtitle="Berichte von Vereinsabenden, Ausstellungen und Projekten aus dem Modellbauclub Bellenberg."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        {news.length === 0 ? (
          <p className="text-muted-foreground">Zurzeit sind keine Neuigkeiten veröffentlicht.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                  <h2 className="mt-2 font-serif text-lg font-bold leading-snug">{item.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {item.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
