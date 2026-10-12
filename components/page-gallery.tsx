import { GalleryGrid } from "@/components/gallery-grid"
import type { PageGalleryItem } from "@/lib/db/schema"

export function PageGallery({ items, title }: { items: PageGalleryItem[] | null; title: string }) {
  if (!items || items.length === 0) return null

  const images = items.map((item, i) => ({
    id: i,
    url: item.url,
    alt: item.caption || `${title} – Bild ${i + 1}`,
    caption: item.caption || null,
  }))

  return (
    <section aria-labelledby="seiten-galerie">
      <h2 id="seiten-galerie" className="mb-6 font-serif text-2xl font-bold">
        Bildergalerie
      </h2>
      <GalleryGrid images={images} />
    </section>
  )
}
