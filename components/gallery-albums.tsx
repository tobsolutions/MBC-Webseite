import Link from "next/link"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

type AlbumCard = {
  id: number
  slug: string
  title: string
  description: string
  coverImage: string | null
  imageCount: number
}

export function GalleryAlbums({ albums }: { albums: AlbumCard[] }) {
  if (albums.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border py-16 text-center text-muted-foreground">
        Es sind noch keine Galerie-Alben vorhanden.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/galerie/${album.slug}`}
          className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-accent"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {album.coverImage ? (
              <Image
                src={album.coverImage || "/placeholder.svg"}
                alt={album.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-10" />
              </div>
            )}
            <span className="absolute bottom-2 right-2 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
              {album.imageCount} {album.imageCount === 1 ? "Bild" : "Bilder"}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-accent">
              {album.title}
            </h3>
            {album.description && (
              <p className="mt-2 line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {album.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
