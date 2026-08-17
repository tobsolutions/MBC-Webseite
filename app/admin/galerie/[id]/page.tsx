import { notFound } from "next/navigation"
import { getGalleryAlbumById } from "@/lib/queries"
import { GalleryManager } from "@/components/admin/gallery-manager"

export const metadata = { title: "Album – Verwaltung | MBC Bellenberg" }

export default async function AdminGalleryAlbum({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getGalleryAlbumById(Number(id))
  if (!data) notFound()

  return (
    <GalleryManager
      album={{ id: data.album.id, title: data.album.title, description: data.album.description }}
      items={data.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, caption: i.caption }))}
    />
  )
}
