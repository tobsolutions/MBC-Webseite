import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPublicPage } from "@/lib/queries"
import { PageHero } from "@/components/page-hero"
import { RichText } from "@/components/rich-text"
import { PageGallery } from "@/components/page-gallery"

export const metadata: Metadata = {
  title: "Willkommen beim Modellbauclub Bellenberg",
  description: "Willkommen beim Modellbauclub Bellenberg e. V.",
}

export default async function QrLandingPage() {
  const page = await getPublicPage("qr")
  if (!page) notFound()

  return (
    <article>
      <PageHero title={page.title} image={page.coverImage} eyebrow="Modellbauclub Bellenberg" />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <RichText content={page.content} />
      </div>
      {page.gallery.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <PageGallery items={page.gallery} title={page.title} />
        </div>
      )}
    </article>
  )
}
