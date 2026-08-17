"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Save } from "lucide-react"
import { saveImage, deleteImage } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUpload, type UploadResult } from "@/components/file-upload"
import { DeleteButton } from "@/components/admin/delete-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type ImageItem = {
  id: number
  url: string
  alt: string
  caption: string | null
}

export type AlbumInfo = {
  id: number
  title: string
  description: string
}

function AddDialog({ albumId }: { albumId: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [upload, setUpload] = useState<UploadResult | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!upload) {
      setError("Bitte zuerst ein Bild hochladen.")
      return
    }
    const fd = new FormData(e.currentTarget)
    fd.set("url", upload.url)
    fd.set("albumId", String(albumId))
    startTransition(async () => {
      const res = await saveImage(fd)
      if (res.ok) {
        setOpen(false)
        setUpload(null)
        router.refresh()
      } else setError(res.error ?? "Fehler beim Speichern.")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Bild hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neues Bild</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Bild</Label>
            <FileUpload
              kind="bilder"
              accept="image/*"
              label="Bild hochladen"
              currentUrl={upload?.url ?? null}
              preview
              onUploaded={(r) => setUpload(r)}
              onClear={() => setUpload(null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-alt">Bildbeschreibung (Alt-Text)</Label>
            <Input id="g-alt" name="alt" placeholder="z. B. Modellbahnanlage im Vereinsheim" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="g-caption">Bildunterschrift (optional)</Label>
            <Input id="g-caption" name="caption" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function GalleryManager({ album, items }: { album: AlbumInfo; items: ImageItem[] }) {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/galerie"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="size-4" /> Zurück zur Album-Übersicht
      </Link>

      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Album</p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">{album.title}</h1>
          {album.description && <p className="mt-1 text-sm text-muted-foreground">{album.description}</p>}
        </div>
        <AddDialog albumId={album.id} />
      </header>

      {items.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">Noch keine Bilder in diesem Album.</Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((img) => (
            <Card key={img.id} className="group relative overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url || "/placeholder.svg"} alt={img.alt} className="aspect-square w-full object-cover" />
              <div className="p-2">
                <p className="truncate text-xs text-muted-foreground">{img.caption || img.alt || "Ohne Titel"}</p>
              </div>
              <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                <DeleteButton onDelete={() => deleteImage(img.id)} iconOnly title="Bild löschen?" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
