import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { PageHero } from "@/components/page-hero"
import { GalleryGrid, type GalleryImage } from "@/components/gallery-grid"
import { getGalleryAlbum } from "@/lib/queries"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getGalleryAlbum(slug)
  if (!data) return { title: "Album nicht gefunden · Modellbauclub Bellenberg e.V." }
  return { title: `${data.album.title} · Galerie · Modellbauclub Bellenberg e.V.` }
}

export default async function GalerieAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getGalleryAlbum(slug)
  if (!data) notFound()

  const { album, images } = data
  const galleryImages: GalleryImage[] = images.map((i) => ({
    id: i.id,
    url: i.url,
    alt: i.alt,
    caption: i.caption,
  }))

  return (
    <div>
      <PageHero title={album.title} eyebrow="Galerie" image={album.coverImage} />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Link
          href="/galerie"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="size-4" /> Zurück zur Galerie
        </Link>

        {album.description && (
          <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            {album.description}
          </p>
        )}

        <div className="mt-10">
          <GalleryGrid images={galleryImages} />
        </div>
      </div>
    </div>
  )
}
