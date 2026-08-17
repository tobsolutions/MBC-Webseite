import { getAllGalleryAlbums } from "@/lib/queries"
import { GalleryAlbumsManager } from "@/components/admin/gallery-albums-manager"

export const metadata = { title: "Galerie – Verwaltung | MBC Bellenberg" }

export default async function AdminGallery() {
  const albums = await getAllGalleryAlbums()
  return <GalleryAlbumsManager albums={albums} />
}
