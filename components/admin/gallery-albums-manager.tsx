"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImageIcon, Loader2, Pencil, Plus, Save } from "lucide-react"
import { saveGalleryAlbum, deleteGalleryAlbum } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DeleteButton } from "@/components/admin/delete-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type AlbumItem = {
  id: number
  slug: string
  title: string
  description: string
  coverImage: string | null
  sortOrder: number
  imageCount: number
}

function AlbumDialog({ album }: { album?: AlbumItem }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await saveGalleryAlbum(fd)
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else setError(res.error ?? "Fehler beim Speichern.")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {album ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-4" /> Bearbeiten
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Album anlegen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{album ? "Album bearbeiten" : "Neues Album"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {album && <input type="hidden" name="id" value={album.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="a-title">Titel</Label>
            <Input id="a-title" name="title" defaultValue={album?.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-desc">Beschreibungstext (optional)</Label>
            <Textarea
              id="a-desc"
              name="description"
              rows={3}
              defaultValue={album?.description}
              placeholder="Kurzer Text, der auf der Galerie-Übersicht und über den Bildern angezeigt wird."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-sort">Sortierung</Label>
            <Input id="a-sort" name="sortOrder" type="number" defaultValue={album?.sortOrder ?? 0} />
          </div>
          {album?.coverImage && <input type="hidden" name="coverImage" value={album.coverImage} />}
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

export function GalleryAlbumsManager({ albums }: { albums: AlbumItem[] }) {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Inhalte</p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Galerie</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Alben verwalten. Bilder fügen Sie innerhalb eines Albums hinzu.
          </p>
        </div>
        <AlbumDialog />
      </header>

      {albums.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">Noch keine Alben angelegt.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Card key={album.id} className="flex flex-col overflow-hidden p-0">
              <Link
                href={`/admin/galerie/${album.id}`}
                className="relative block aspect-[4/3] overflow-hidden bg-muted"
              >
                {album.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.coverImage || "/placeholder.svg"}
                    alt={album.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-8" />
                  </span>
                )}
                <span className="absolute bottom-2 right-2 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium backdrop-blur">
                  {album.imageCount} {album.imageCount === 1 ? "Bild" : "Bilder"}
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link href={`/admin/galerie/${album.id}`} className="font-serif font-bold hover:text-accent">
                  {album.title}
                </Link>
                {album.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{album.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <AlbumDialog album={album} />
                  <DeleteButton
                    onDelete={() => deleteGalleryAlbum(album.id)}
                    title="Album löschen?"
                    description="Das Album und alle darin enthaltenen Bilder werden dauerhaft gelöscht."
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
