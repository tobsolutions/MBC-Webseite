import type { Metadata } from "next"
import { PageHero } from "@/components/page-hero"
import { GalleryAlbums } from "@/components/gallery-albums"
import { getGalleryAlbums } from "@/lib/queries"

export const metadata: Metadata = {
  title: "Galerie · Modellbauclub Bellenberg e.V.",
}

export default async function GaleriePage() {
  const albums = await getGalleryAlbums()

  return (
    <div>
      <PageHero
        title="Galerie"
        eyebrow="Einblicke"
        subtitle="Impressionen aus unserer Werkstatt, von Anlagen, Modellen und Ausstellungen."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <GalleryAlbums albums={albums} />
      </div>
    </div>
  )
}
