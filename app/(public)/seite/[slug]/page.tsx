import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPublicPage } from "@/lib/queries"
import { PageHero } from "@/components/page-hero"
import { RichText } from "@/components/rich-text"

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

  return (
    <article>
      <PageHero title={page.title} image={page.coverImage} eyebrow="Modellbauclub Bellenberg" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <RichText content={page.content} />
      </div>
    </article>
  )
}
