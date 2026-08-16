import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { GalleryGrid, type GalleryImage } from "@/components/gallery-grid"
import { getGalleryImages } from "@/lib/queries"

export const metadata: Metadata = {
  title: "Galerie · Modellbauclub Bellenberg e.V.",
}

export default async function GaleriePage() {
  const images = await getGalleryImages()
  const galleryImages: GalleryImage[] = images.map((i) => ({
    id: i.id,
    url: i.url,
    alt: i.alt,
    caption: i.caption,
    album: i.album,
  }))

  return (
    <div>
      <PageHero
        title="Galerie"
        eyebrow="Einblicke"
        subtitle="Impressionen aus unserer Werkstatt, von Anlagen, Modellen und Ausstellungen."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <GalleryGrid images={galleryImages} />
      </div>
    </div>
  )
}
