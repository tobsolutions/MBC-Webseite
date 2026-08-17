import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export type SubPage = {
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
}

export function SubpageList({ pages }: { pages: SubPage[] }) {
  if (pages.length === 0) return null

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => (
        <Link
          key={page.slug}
          href={`/seite/${page.slug}`}
          className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-accent"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
            {page.coverImage ? (
              <Image
                src={page.coverImage || "/placeholder.svg"}
                alt={page.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Modellbauclub Bellenberg
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-serif text-lg font-bold text-card-foreground">{page.title}</h3>
            {page.excerpt && (
              <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">{page.excerpt}</p>
            )}
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              Mehr erfahren
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
