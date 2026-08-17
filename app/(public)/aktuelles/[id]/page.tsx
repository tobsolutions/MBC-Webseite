import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { getNewsItem } from "@/lib/queries"
import { RichText } from "@/components/rich-text"
import { formatDate } from "@/lib/format"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const item = await getNewsItem(Number(id))
  if (!item) return { title: "Beitrag nicht gefunden" }
  return { title: `${item.title} · Modellbauclub Bellenberg e.V.` }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = Number(id)
  if (Number.isNaN(numId)) notFound()
  const item = await getNewsItem(numId)
  if (!item || !item.published) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/seite/verein#aktuelles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Zurück zu Aktuelles
      </Link>

      <time className="mt-8 block font-mono text-xs uppercase tracking-widest text-accent">
        {formatDate(item.publishedAt)}
      </time>
      <h1 className="mt-2 text-balance font-serif text-3xl font-bold md:text-4xl">{item.title}</h1>

      {item.image && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-sm border border-border bg-muted">
          <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
        </div>
      )}

      <div className="mt-10">
        <RichText content={item.content || item.excerpt} />
      </div>
    </article>
  )
}
