"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Save, FileText } from "lucide-react"
import { saveDocument, deleteDocument } from "@/app/actions/admin"
import { formatDate, formatFileSize } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileUpload, type UploadResult } from "@/components/file-upload"
import { DeleteButton } from "@/components/admin/delete-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type DocItem = {
  id: number
  title: string
  description: string
  fileName: string
  fileUrl: string
  fileSize: number | null
  category: string
  visibility: string
  createdAt: Date | string
}

const VIS_LABEL: Record<string, string> = {
  mitglied: "Mitglieder",
  ausstellungshelfer: "Ausstellungshelfer",
}

function AddDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [upload, setUpload] = useState<UploadResult | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!upload) {
      setError("Bitte zuerst eine Datei hochladen.")
      return
    }
    const fd = new FormData(e.currentTarget)
    fd.set("fileUrl", upload.url)
    fd.set("fileName", upload.fileName)
    fd.set("fileSize", String(upload.fileSize))
    startTransition(async () => {
      const res = await saveDocument(fd)
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
          <Plus className="size-4" /> Dokument hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neues Dokument</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="d-title">Titel</Label>
            <Input id="d-title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-desc">Beschreibung</Label>
            <Textarea id="d-desc" name="description" rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="d-cat">Kategorie</Label>
              <Input id="d-cat" name="category" defaultValue="allgemein" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-vis">Sichtbarkeit</Label>
              <select
                id="d-vis"
                name="visibility"
                defaultValue="mitglied"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="mitglied">Alle Mitglieder</option>
                <option value="ausstellungshelfer">Nur Ausstellungshelfer</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Datei</Label>
            <FileUpload
              kind="dokumente"
              label="Datei hochladen"
              currentUrl={upload?.url ?? null}
              onUploaded={(r) => setUpload(r)}
              onClear={() => setUpload(null)}
            />
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

export function DocumentsManager({ items }: { items: DocItem[] }) {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Intern</p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Dokumente</h1>
        </div>
        <AddDialog />
      </header>

      <Card className="divide-y divide-border">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Noch keine Dokumente.</p>
        ) : (
          items.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center gap-3 p-4">
              <FileText className="size-5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{doc.title}</span>
                  <Badge variant="secondary">{VIS_LABEL[doc.visibility] ?? doc.visibility}</Badge>
                  <Badge variant="outline">{doc.category}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {doc.fileName}
                  {doc.fileSize ? ` · ${formatFileSize(doc.fileSize)}` : ""} · {formatDate(doc.createdAt)}
                </p>
              </div>
              <DeleteButton onDelete={() => deleteDocument(doc.id)} iconOnly title={`„${doc.title}" löschen?`} />
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
