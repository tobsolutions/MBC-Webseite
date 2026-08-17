import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPublicPage, getPublishedNews, getChildPages } from "@/lib/queries"
import { PageHero } from "@/components/page-hero"
import { RichText } from "@/components/rich-text"
import { NewsGrid } from "@/components/news-grid"
import { SubpageList } from "@/components/subpage-list"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPublicPage(slug)
  if (!page) return { title: "Seite nicht gefunden" }
  return {
    title: `${page.title} · Modellbauclub Bellenberg e.V.`,
  }
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPublicPage(slug)
  if (!page) notFound()

  const showNews = slug === "verein"
  const [news, children] = await Promise.all([
    showNews ? getPublishedNews() : Promise.resolve([]),
    getChildPages(page.id),
  ])

  return (
    <article>
      <PageHero title={page.title} image={page.coverImage} eyebrow="Modellbauclub Bellenberg" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <RichText content={page.content} />
      </div>

      {children.length > 0 && (
        <section className="border-t border-border bg-secondary/50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Übersicht</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Weitere Themen</h2>
            <div className="mt-10">
              <SubpageList pages={children} />
            </div>
          </div>
        </section>
      )}

      {showNews && (
        <section id="aktuelles" className="scroll-mt-20 border-t border-border bg-secondary/50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Neuigkeiten</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Aktuelles aus dem Verein</h2>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              Berichte von Vereinsabenden, Ausstellungen und Projekten aus dem Modellbauclub Bellenberg.
            </p>
            <div className="mt-10">
              <NewsGrid news={news} />
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
