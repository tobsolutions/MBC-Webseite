"use client"

import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export type GalleryImage = {
  id: number
  url: string
  alt: string
  caption: string | null
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null)

  const close = useCallback(() => setIndex(null), [])
  const showPrev = useCallback(() => {
    setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length))
  }, [images.length])
  const showNext = useCallback(() => {
    setIndex((i) => (i === null ? i : (i + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (index === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
      else if (e.key === "ArrowLeft") showPrev()
      else if (e.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, close, showPrev, showNext])

  if (images.length === 0) {
    return <p className="text-muted-foreground">In diesem Album wurden noch keine Bilder hochgeladen.</p>
  }

  const current = index === null ? null : images[index]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setIndex(i)}
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

      {current && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Schließen"
            onClick={close}
          >
            <X className="size-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-sm bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Vorheriges Bild"
                onClick={(e) => {
                  e.stopPropagation()
                  showPrev()
                }}
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-sm bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Nächstes Bild"
                onClick={(e) => {
                  e.stopPropagation()
                  showNext()
                }}
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative max-h-[80vh]">
              <Image
                src={current.url || "/placeholder.svg"}
                alt={current.alt || current.caption || "Galeriebild"}
                width={1200}
                height={800}
                className="h-auto max-h-[80vh] w-auto rounded-sm object-contain"
              />
            </div>
            <figcaption className="mt-3 flex items-center justify-center gap-3 text-sm text-white/80">
              {current.caption && <span>{current.caption}</span>}
              {images.length > 1 && (
                <span className="font-mono text-xs text-white/60">
                  {index! + 1} / {images.length}
                </span>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  )
}
