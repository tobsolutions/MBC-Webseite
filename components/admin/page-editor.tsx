"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { savePage } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"

type PageData = {
  id: number
  slug: string
  title: string
  content: string
  coverImage: string | null
  visibility: string
  sortOrder: number
  showInNav: boolean
  published: boolean
}

export function PageEditor({ page }: { page: PageData | null }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(page?.coverImage ?? null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("coverImage", coverImage ?? "")
    startTransition(async () => {
      const res = await savePage(formData)
      if (res.ok) {
        router.push("/admin/seiten")
        router.refresh()
      } else {
        setError(res.error ?? "Speichern fehlgeschlagen.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {page && <input type="hidden" name="id" value={page.id} />}

      <div className="space-y-1.5">
        <Label htmlFor="title">Titel</Label>
        <Input id="title" name="title" defaultValue={page?.title} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">URL-Kürzel (Slug)</Label>
        <Input id="slug" name="slug" defaultValue={page?.slug} placeholder="wird automatisch erzeugt" />
        <p className="text-xs text-muted-foreground">Leer lassen, um aus dem Titel zu erzeugen.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Inhalt</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={page?.content}
          rows={12}
          placeholder="Text der Seite. Leerzeile = neuer Absatz. Zeile mit # = Überschrift."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Titelbild (optional)</Label>
        <FileUpload
          kind="bilder"
          accept="image/*"
          label="Bild hochladen"
          currentUrl={coverImage}
          preview
          onUploaded={(r) => setCoverImage(r.url)}
          onClear={() => setCoverImage(null)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="visibility">Sichtbarkeit</Label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={page?.visibility ?? "public"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="public">Öffentlich</option>
            <option value="mitglied">Nur Mitglieder</option>
            <option value="ausstellungshelfer">Nur Ausstellungshelfer</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sortOrder">Reihenfolge</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={page?.sortOrder ?? 0} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="showInNav" defaultChecked={page?.showInNav ?? true} className="size-4" />
          In der Navigation anzeigen
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={page?.published ?? true} className="size-4" />
          Veröffentlicht
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Speichern
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/seiten")}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
