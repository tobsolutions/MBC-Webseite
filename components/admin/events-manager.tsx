"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Pencil, Save, MapPin } from "lucide-react"
import { saveEvent, deleteEvent } from "@/app/actions/admin"
import { formatEventWhen } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DeleteButton } from "@/components/admin/delete-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type EventItem = {
  id: number
  title: string
  description: string
  location: string | null
  startAt: Date | string
  endAt: Date | string | null
  allDay: boolean
  visibility: string
  clubInternal: boolean
}

const VIS_LABEL: Record<string, string> = {
  public: "Öffentlich",
  mitglied: "Mitglieder",
  ausstellungshelfer: "Ausstellungshelfer",
}

function toLocalDatetime(d: Date | string | null) {
  if (!d) return ""
  const date = new Date(d)
  const off = date.getTimezoneOffset()
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 16)
}

function EventDialog({ item, trigger }: { item: EventItem | null; trigger: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await saveEvent(fd)
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
          <DialogTitle>{item ? "Termin bearbeiten" : "Neuer Termin"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {item && <input type="hidden" name="id" value={item.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="e-title">Titel</Label>
            <Input id="e-title" name="title" defaultValue={item?.title} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="e-start">Beginn</Label>
              <Input
                id="e-start"
                name="startAt"
                type="datetime-local"
                defaultValue={toLocalDatetime(item?.startAt ?? null)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-end">Ende (optional)</Label>
              <Input
                id="e-end"
                name="endAt"
                type="datetime-local"
                defaultValue={toLocalDatetime(item?.endAt ?? null)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-location">Ort (optional)</Label>
            <Input id="e-location" name="location" defaultValue={item?.location ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-desc">Beschreibung</Label>
            <Textarea id="e-desc" name="description" defaultValue={item?.description} rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-vis">Sichtbarkeit</Label>
            <select
              id="e-vis"
              name="visibility"
              defaultValue={item?.visibility ?? "public"}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="public">Öffentlich</option>
              <option value="mitglied">Nur Mitglieder</option>
              <option value="ausstellungshelfer">Nur Ausstellungshelfer</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="allDay" defaultChecked={item?.allDay ?? false} className="size-4" />
            Ganztägig
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="clubInternal"
              defaultChecked={item?.clubInternal ?? false}
              className="size-4"
            />
            Als „vereinsintern" kennzeichnen
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

export function EventsManager({ items }: { items: EventItem[] }) {
  const now = Date.now()
  const upcoming = items.filter((e) => new Date(e.startAt).getTime() >= now)
  const past = items.filter((e) => new Date(e.startAt).getTime() < now).reverse()

  function renderRow(item: EventItem) {
    return (
      <div key={item.id} className="flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{item.title}</span>
            <Badge variant="secondary">{VIS_LABEL[item.visibility] ?? item.visibility}</Badge>
            {item.clubInternal && <Badge variant="outline">Vereinsintern</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatEventWhen(item.startAt, item.endAt, item.allDay)}
            {item.location ? (
              <span className="ml-2 inline-flex items-center gap-1">
                <MapPin className="size-3" /> {item.location}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EventDialog
            item={item}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="size-4" /> Bearbeiten
              </Button>
            }
          />
          <DeleteButton onDelete={() => deleteEvent(item.id)} iconOnly title={`„${item.title}" löschen?`} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Inhalte</p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">Termine</h1>
        </div>
        <EventDialog
          item={null}
          trigger={
            <Button>
              <Plus className="size-4" /> Neuer Termin
            </Button>
          }
        />
      </header>

      <section className="space-y-2">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Kommende Termine</h2>
        <Card className="divide-y divide-border">
          {upcoming.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Keine kommenden Termine.</p>
          ) : (
            upcoming.map(renderRow)
          )}
        </Card>
      </section>

      {past.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Vergangene Termine</h2>
          <Card className="divide-y divide-border opacity-70">{past.map(renderRow)}</Card>
        </section>
      )}
    </div>
  )
}
