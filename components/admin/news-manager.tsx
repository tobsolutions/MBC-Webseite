"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Pencil, Save } from "lucide-react"
import { saveNews, deleteNews } from "@/app/actions/admin"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/file-upload"
import { DeleteButton } from "@/components/admin/delete-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type NewsItem = {
  id: number
  title: string
  excerpt: string
  content: string
  image: string | null
  published: boolean
  publishedAt: Date | string
}

function toLocalInput(d: Date | string) {
  const date = new Date(d)
  const off = date.getTimezoneOffset()
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 10)
}

function NewsDialog({ item, trigger }: { item: NewsItem | null; trigger: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(item?.image ?? null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set("image", image ?? "")
    startTransition(async () => {
      const res = await saveNews(fd)
      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else setError(res.error ?? "Fehler beim Speichern.")
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Beitrag bearbeiten" : "Neuer Beitrag"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {item && <input type="hidden" name="id" value={item.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="n-title">Titel</Label>
            <Input id="n-title" name="title" defaultValue={item?.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="n-date">Datum</Label>
            <Input
              id="n-date"
              name="publishedAt"
              type="date"
              defaultValue={toLocalInput(item?.publishedAt ?? new Date())}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="n-excerpt">Kurztext</Label>
            <Textarea id="n-excerpt" name="excerpt" defaultValue={item?.excerpt} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="n-content">Inhalt</Label>
            <Textarea id="n-content" name="content" defaultValue={item?.content} rows={8} />
          </div>
          <div className="space-y-1.5">
            <Label>Bild (optional)</Label>
            <FileUpload
              kind="bilder"
              accept="image/*"
              label="Bild hochladen"
              currentUrl={image}
              preview
              onUploaded={(r) => setImage(r.url)}
              onClear={() => setImage(null)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={item?.published ?? true} className="size-4" />
            Veröffentlicht
          </label>
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

export function NewsManager({ items }: { items: NewsItem[] }) {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Inhalte</p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Aktuelles</h1>
        </div>
        <NewsDialog
          item={null}
          trigger={
            <Button>
              <Plus className="size-4" /> Neuer Beitrag
            </Button>
          }
        />
      </header>

      <Card className="divide-y divide-border">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Noch keine Beiträge.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.title}</span>
                  {!item.published && <Badge variant="secondary">Entwurf</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(item.publishedAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <NewsDialog
                  item={item}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Pencil className="size-4" /> Bearbeiten
                    </Button>
                  }
                />
                <DeleteButton
                  onDelete={() => deleteNews(item.id)}
                  iconOnly
                  title={`„${item.title}" löschen?`}
                />
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
