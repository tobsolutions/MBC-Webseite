"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type GalleryImage = {
  id: number
  url: string
  alt: string
  caption: string | null
  album: string
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const albums = useMemo(() => {
    const set = Array.from(new Set(images.map((i) => i.album)))
    return ["Alle", ...set]
  }, [images])

  const [album, setAlbum] = useState("Alle")
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)

  const filtered = album === "Alle" ? images : images.filter((i) => i.album === album)

  if (images.length === 0) {
    return <p className="text-muted-foreground">Es wurden noch keine Bilder hochgeladen.</p>
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {albums.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAlbum(a)}
            className={cn(
              "rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors",
              album === a
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightbox(img)}
            className="group relative aspect-square overflow-hidden rounded-sm border border-border bg-muted"
          >
            <Image
              src={img.url || "/placeholder.svg"}
              alt={img.alt || img.caption || "Galeriebild"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-primary/85 p-2 text-left text-xs text-primary-foreground transition-transform group-hover:translate-y-0">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Schließen"
            onClick={() => setLightbox(null)}
          >
            <X className="size-5" />
          </button>
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative max-h-[80vh]">
              <Image
                src={lightbox.url || "/placeholder.svg"}
                alt={lightbox.alt || lightbox.caption || "Galeriebild"}
                width={1200}
                height={800}
                className="h-auto max-h-[80vh] w-auto rounded-sm object-contain"
              />
            </div>
            {lightbox.caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">{lightbox.caption}</figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  )
}
