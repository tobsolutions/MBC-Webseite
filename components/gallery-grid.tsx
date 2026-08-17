"use client"

import Image from "next/image"
import { useState } from "react"
import { X } from "lucide-react"

export type GalleryImage = {
  id: number
  url: string
  alt: string
  caption: string | null
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)

  if (images.length === 0) {
    return <p className="text-muted-foreground">In diesem Album wurden noch keine Bilder hochgeladen.</p>
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
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
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
