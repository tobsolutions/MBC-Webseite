import { notFound } from "next/navigation"
import Image from "next/image"
import { requireUser } from "@/lib/session"
import { getInternalPage } from "@/lib/queries"
import { RichText } from "@/components/rich-text"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await requireUser()
  const page = await getInternalPage(slug, user.role)
  return { title: page ? `${page.title} – Mitgliederbereich | MBC Bellenberg e.V.` : "Seite nicht gefunden" }
}

export default async function InternCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await requireUser(`/intern/seite/${slug}`)
  const page = await getInternalPage(slug, user.role)
  if (!page) notFound()

  return (
    <article>
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Interne Seite</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-balance">{page.title}</h1>
      </header>

      {page.coverImage && (
        <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-sm border border-border">
          <Image src={page.coverImage || "/placeholder.svg"} alt={page.title} fill className="object-cover" />
        </div>
      )}

      <div className="mt-6">
        <RichText content={page.content} />
      </div>
    </article>
  )
}
