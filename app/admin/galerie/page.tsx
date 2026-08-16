import { getAllImages } from "@/lib/queries"
import { GalleryManager } from "@/components/admin/gallery-manager"

export const metadata = { title: "Galerie – Verwaltung | MBC Bellenberg" }

export default async function AdminGallery() {
  const items = await getAllImages()
  return <GalleryManager items={items} />
}
