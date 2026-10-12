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
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { PageGalleryEditor } from "@/components/admin/page-gallery-editor"
import type { PageGalleryItem } from "@/lib/db/schema"

type PageData = {
  gallery: PageGalleryItem[]
  id: number
  slug: string
  title: string
  content: string
  excerpt: string
  coverImage: string | null
  parentId: number | null
  visibility: string
  sortOrder: number
  showInNav: boolean
  published: boolean
}

type PageOption = {
  id: number
  title: string
  parentId: number | null
  sortOrder: number
  visibility: string
}

const VISIBILITY_GROUPS: { label: string; match: (v: string) => boolean }[] = [
  { label: "Öffentliche Seiten", match: (v) => v === "public" },
  { label: "Mitglieder / Ausstellungshelfer", match: (v) => v !== "public" },
]

function buildParentOptions(pages: PageOption[], currentId: number | undefined) {
  const ids = new Set(pages.map((p) => p.id))
  const children = new Map<number | null, PageOption[]>()
  for (const p of pages) {
    const key = p.parentId !== null && ids.has(p.parentId) ? p.parentId : null
    const list = children.get(key) ?? []
    list.push(p)
    children.set(key, list)
  }
  for (const list of children.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "de"))
  }

  const result: { page: PageOption; depth: number }[] = []
  function walk(parentId: number | null, depth: number) {
    for (const p of children.get(parentId) ?? []) {
      // The page itself and its descendants cannot become its parent.
      if (p.id === currentId) continue
      result.push({ page: p, depth })
      walk(p.id, depth + 1)
    }
  }
  walk(null, 0)
  return result
}

function optionLabel(title: string, depth: number) {
  if (depth === 0) return title
  return `${"\u00A0\u00A0\u00A0\u00A0".repeat(depth - 1)}\u00A0\u00A0└ ${title}`
}

export function PageEditor({ page, allPages }: { page: PageData | null; allPages: PageOption[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(page?.coverImage ?? null)
  const [gallery, setGallery] = useState<PageGalleryItem[]>(page?.gallery ?? [])
  const parentOptions = buildParentOptions(allPages, page?.id)
  const pageById = new Map(allPages.map((p) => [p.id, p]))
  function rootOf(p: PageOption) {
    let current = p
    const seen = new Set<number>()
    while (current.parentId !== null && pageById.has(current.parentId) && !seen.has(current.id)) {
      seen.add(current.id)
      current = pageById.get(current.parentId)!
    }
    return current
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("coverImage", coverImage ?? "")
    formData.set("gallery", JSON.stringify(gallery))
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
        <Label htmlFor="parentId">Übergeordnete Seite</Label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={page?.parentId ? String(page.parentId) : ""}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">— Keine (eigenständige Hauptseite)</option>
          {VISIBILITY_GROUPS.map((group) => {
            const options = parentOptions.filter(({ page: p }) => {
              const root = rootOf(p)
              return group.match(root.visibility)
            })
            if (options.length === 0) return null
            return (
              <optgroup key={group.label} label={group.label}>
                {options.map(({ page: p, depth }) => (
                  <option key={p.id} value={p.id}>
                    {optionLabel(p.title, depth)}
                  </option>
                ))}
              </optgroup>
            )
          })}
        </select>
        <p className="text-xs text-muted-foreground">
          Als Unterseite einer anderen Seite zuordnen. Erscheint dann im Menü als Dropdown. Eingerückte Einträge sind
          bereits Unterseiten; die aktuelle Seite und ihre Unterseiten sind nicht wählbar.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Inhalt</Label>
        <RichTextEditor name="content" defaultValue={page?.content} placeholder="Inhalt der Seite" />
        <p className="text-xs text-muted-foreground">
          Text über die Werkzeugleiste formatieren. Über „HTML“ lässt sich der Quelltext direkt bearbeiten.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Kurztext-Auszug</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={page?.excerpt}
          rows={3}
          placeholder="Kurze Beschreibung, die in der Auflistung auf der übergeordneten Seite erscheint."
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

      <div className="space-y-1.5">
        <Label>Bildergalerie (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Eigene Bilder nur für diese Seite. Sie erscheinen unter dem Inhalt und sind unabhängig von der Galerie-Seite.
        </p>
        <PageGalleryEditor items={gallery} onChange={setGallery} />
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
