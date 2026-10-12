import { notFound } from "next/navigation"
import Image from "next/image"
import { requireHelperAccess } from "@/lib/helper-access"
import { getHelperPage, getPageAncestors } from "@/lib/queries"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { RichText } from "@/components/rich-text"
import { PageGallery } from "@/components/page-gallery"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireHelperAccess()
  const page = await getHelperPage(slug)
  return { title: page ? `${page.title} – Helferbereich | MBC Bellenberg e.V.` : "Seite nicht gefunden" }
}

export default async function HelperCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireHelperAccess()
  const page = await getHelperPage(slug)
  if (!page) notFound()

  const ancestors = page.parentId != null ? await getPageAncestors(page.parentId, ["ausstellungshelfer"]) : []

  return (
    <article>
      {page.parentId != null && (
        <PageBreadcrumb
          className="mb-4"
          current={page.title}
          items={[
            { href: "/helfer", label: "Helferbereich" },
            ...ancestors.map((a) => ({ href: `/helfer/seite/${a.slug}`, label: a.title })),
          ]}
        />
      )}
      <header className="border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Ausstellung</p>
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

      {page.gallery.length > 0 && (
        <div className="mt-10">
          <PageGallery items={page.gallery} title={page.title} />
        </div>
      )}
    </article>
  )
}
