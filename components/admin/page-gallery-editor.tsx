"use client"

import type React from "react"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/file-upload"
import type { PageGalleryItem } from "@/lib/db/schema"

export function PageGalleryEditor({
  items,
  galleryTitle,
  onChange,
}: {
  items: PageGalleryItem[]
  galleryTitle: string
  onChange: React.Dispatch<React.SetStateAction<PageGalleryItem[]>>
}) {
  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={`${item.url}-${i}`} className="flex items-center gap-3 rounded-md border border-border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url || "/placeholder.svg"}
                alt={item.caption || `Galeriebild ${i + 1}`}
                className="size-16 shrink-0 rounded-sm border border-border object-cover"
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Input
                  aria-label={`Bildunterschrift für Bild ${i + 1}`}
                  value={item.caption}
                  placeholder="Untertitel"
                  maxLength={200}
                  onChange={(e) =>
                    onChange(items.map((it, j) => (j === i ? { ...it, caption: e.target.value } : it)))
                  }
                />
                <Input
                  aria-label={`Beschreibung für Bild ${i + 1}`}
                  value={item.description ?? ""}
                  placeholder="Beschreibung"
                  maxLength={500}
                  onChange={(e) =>
                    onChange(items.map((it, j) => (j === i ? { ...it, description: e.target.value } : it)))
                  }
                />
              </div>
              <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={item.aiGenerated === true}
                  onChange={(e) =>
                    onChange(items.map((it, j) => (j === i ? { ...it, aiGenerated: e.target.checked } : it)))
                  }
                  className="size-3.5"
                />
                KI-Bild
              </label>
              <div className="flex shrink-0 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Nach oben"
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="Nach unten"
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                  aria-label="Bild entfernen"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <FileUpload
        kind="bilder"
        accept="image/*"
        label="Bilder zur Galerie hinzufügen"
        multiple
        onUploaded={(r) =>
          onChange((current) => [
            ...current,
            { url: r.url, caption: galleryTitle, description: galleryTitle, aiGenerated: false },
          ])
        }
      />
    </div>
  )
}
